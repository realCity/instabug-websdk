/**
 * @module instabug-websdk/bugReport
 */

/* eslint-disable no-console */

import elem from './element';
import utils from './utils';
import logs from './logs';
import xhr from './xhr';

/**
 * @const
 * @type {object}
 * @description current date time object
 * @default
 */
const reportStartingTime = Date.now();

let attachLocalStorage = true;
let logSource;

/**
 * @const
 * @type {object}
 * @description zapier and cloudinary integration data
 * @default
 */
const IntegrationData = {};


/**
 * setZapierHookUrl - set zapier webhook url
 *
 * @param  {string} webhookUrl zapier webhook url;
 */
function setZapierHookUrl(webhookUrl) {
  IntegrationData.zapierWebhookUrl = webhookUrl;
}


/**
 * getZapierHookUrl - return zapier webhook url
 *
 * @return {string} zapier webhook url
 */
function getZapierHookUrl() {
  return IntegrationData.zapierWebhookUrl;
}


/**
 * setCloudinaryIntegration - setup cloudinary integration data
 *
 * @param  {type} cloudName    cloudinary cloudname
 * @param  {type} uploadPreset cloudinary upload preset
 */
function setCloudinaryIntegration(cloudName, uploadPreset) {
  IntegrationData.cloudinaryCloudName = cloudName;
  IntegrationData.cloudinaryUploadPreset = uploadPreset;
}

function disableLocalStorage() {
  attachLocalStorage = false;
}

function setLogSource(source) {
  logSource = source;
}

/**
 * _uploadBugScreenshot - convert annotated screenshot to image, then upload it
 *
 * @return {object} XHR Promise object for the image upload request
 */
function _uploadBugScreenshot() {
  const drawingCanvas = document.getElementById('drawingCanvas');
  // incase of no screenshot to attach
  if (!drawingCanvas) return false;

  const image = drawingCanvas.toDataURL('image/png');
  const blob = utils.dataURItoBlob(image);
  return uploadCloudinary(blob, 'image.png');
}

function uploadCloudinary(file, filename, extra) {
  const formData = new FormData();
  const cloudName = IntegrationData.cloudinaryCloudName;
  const uploadPreset = IntegrationData.cloudinaryUploadPreset;

  formData.append('file', file, filename);
  formData.append('upload_preset', uploadPreset);
  formData.append('tags', 'instabug_screenshot');
  if (extra) {
    Object.keys(extra).forEach((key) => {
      formData.append(key, extra[key]);
    });
  }

  return xhr.xhr({
    method: 'POST',
    url: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    stringify: false,
  }).catch(() => null);
}

function uploadExtraImage() {
  const extraImage = document.getElementById('extra-image');
  if (extraImage.files.length === 0) {
    return false;
  }
  return uploadCloudinary(extraImage.files[0], 'extra.png');
}

function uploadLogFile() {
  const text = JSON.stringify(logSource());
  const blob = new Blob([text], {
    type: 'application/json',
  });

  return uploadCloudinary(blob, 'network-logs.json', { resource_type: 'raw' });
}

function uploadBugImages() {
  const uploads = [
    _uploadBugScreenshot(),
    uploadExtraImage(),
  ].filter(u => u); // filter false values

  return Promise.all(uploads);
}

/**
 * getMemoryUsed - get current memory used by browser
 *
 * @return {object | bool}  return used and total memory, if api is not supported return false
 */
function getMemoryUsed() {
  let output;
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    output = {
      used: memory.usedJSHeapSize / 1000000,
      total: memory.jsHeapSizeLimit / 1000000,
    };
  } else {
    console.warn('We can\'t collect the memory information from your browser');
    output = false;
  }
  return output;
}


/**
 * getBrowserData - get browser information that we used in the report
 *
 * @return {object}  borwser information - browser name, os, navigatorInfo and locale
 */
function getBrowserData() {
  const nVer = navigator.appVersion;
  const currentBrowserData = {};
  let browserName = navigator.appName;

  // browserName = nVer.match(/(firefox|msie|chrome|safari)[/\s]([\d.]+)/ig)[0];
  if (nVer.match(/(firefox|msie|chrome|safari|opr|trident)[/\s]([\d.]+)/ig)) {
    if (nVer.match(/Edge/g)) {
      browserName = 'edge';
    } else if (nVer.match(/Trident/g)) {
      browserName = 'ie';
    } else if (nVer.match(/opr/ig)) {
      browserName = nVer.match(/(opr)[/\s]([\d.]+)/ig)[0];
    } else {
      browserName = nVer.match(/(firefox|msie|chrome|safari)[/\s]([\d.]+)/ig)[0];
    }
  } else {
    browserName = 'Unknown';
    if (navigator.userAgent.match(/firefox/ig)) {
      browserName = 'firefox';
    }
  }

  let OSName = 'Unknown OS';
  if (nVer.indexOf('Win') !== -1) OSName = 'Windows';
  if (nVer.indexOf('Mac') !== -1) OSName = 'MacOS';
  if (nVer.indexOf('X11') !== -1) OSName = 'UNIX';
  if (nVer.indexOf('Linux') !== -1) OSName = 'Linux';

  currentBrowserData.browserName = browserName;
  currentBrowserData.Os = OSName;
  currentBrowserData.navigatorInfo = navigator;
  currentBrowserData.locale = navigator.language;

  return currentBrowserData;
}

/**
 * prepareBugReport - prepare and return the bug report object
 *
 * @return {object} complete bug report object
 */
function prepareBugReport() {
  const form = document.getElementById('instabugForm');

  const report = {
    reported_at: Date.now(),
    email: form.email.value,
    title: form.comment.value,
    device: getBrowserData().browserName,
    os: getBrowserData().Os,
    current_view: location.href,
    duration: utils.shortifyTime(Date.now() - reportStartingTime),
    locale: getBrowserData().locale,
    screen_size: `${window.innerWidth}x${window.innerHeight}`,
    density: window.devicePixelRatio,
    console_log: JSON.stringify(logs.getConsoleLog()),
  };

  if (attachLocalStorage) {
    report.localStorage = JSON.stringify(localStorage);
  }

  if (getMemoryUsed()) {
    report.memory = getMemoryUsed();
  }

  return report;
}

function _prepareBugReportRequest(bugReportDetails, webHookURL) {
  return xhr.xhr({
    method: 'POST',
    url: webHookURL,
    body: bugReportDetails,
    stringify: true,
  });
}

function finallyPolyfill(promise, cb) {
  promise.then(() => cb());
  promise.catch((err) => {
    cb();
    throw err;
  });
}

function submitBugReport() {
  const bugReport = prepareBugReport();
  const bugImagesUpload = uploadBugImages();
  const zapierWebhookUrl = IntegrationData.zapierWebhookUrl;

  elem.hide('#instabugFormContainer');
  elem.show('#instabugLoading');

  const uploads = [bugImagesUpload];
  if (logSource) {
    uploads.push(uploadLogFile());
  }

  finallyPolyfill(Promise.all(uploads).then(([imageResponses, logUploadResponse]) => {
    bugReport.screenshots = imageResponses.map((response) => {
      if (response && response.status === 'OK' && response.data && response.data.secure_url) {
        return response.data.secure_url;
      }
      return response;
    });
    bugReport.screenshotsText = bugReport.screenshots
      .map((screenshot, idx) => `[Screenshot #${idx + 1}|${screenshot}]`).join('\n');

    if (logUploadResponse) {
      bugReport.networkLog = logUploadResponse.data && logUploadResponse.data.secure_url;
    }
  }), () => {
    finallyPolyfill(_prepareBugReportRequest(bugReport, zapierWebhookUrl), () => {
      elem.hide('#instabugLoading');
      elem.show('#instabugThankYouPage');
    });
  });
}

module.exports = {
  setZapierHookUrl,
  setCloudinaryIntegration,
  disableLocalStorage,
  setLogSource,
  submitBugReport,
  getBrowserData,
  getZapierHookUrl,
};

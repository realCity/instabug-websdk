
/**
 * @module instabug-websdk/views
 */
import elem from './element';
import extension from './extension';
import bugReport from './bugReport';
import utils from './utils';
import translation from './translation';

const downloadExtensionView = require('./views/download-extension.html');
const loadingWindowView = require('./views/loading-window.html');
const ThankyouView = require('./views/thank-you.html');
const submitFormView = require('./views/submitForm.html');

require('./views/styles.css');

function translate(html) {
  return html.replace(/%([^%]*)%/g, (all, prop) => translation.current[prop]);
}

function isImage(file) {
  return file.name.match(/\.(png|gif|jpg|bmp|pdf)$/i);
}

function addSubmitForm() {
  const node = document.createElement('div');

  node.setAttribute('class', 'ibgsdk-element instabug-window instabug-form');
  node.setAttribute('id', 'instabugFormContainer');
  node.setAttribute('style', 'display:none;');

  node.innerHTML = translate(submitFormView);
  document.body.appendChild(node);
  const extraImage = document.getElementById('extra-image');
  extraImage.addEventListener('change', () => {
    const fileError = extraImage.files.length && !isImage(extraImage.files[0]);
    document.getElementById('extra-image-error').style.display = fileError ? null : 'none';
  });
  if (extension.pluginIsInstalled()) {
    elem.hide('#download-instabug-plugin');
  }
}

function resetAndClose() {
  while (document.getElementsByClassName('ibgsdk-element').length) {
    document.body.removeChild(document.getElementsByClassName('ibgsdk-element')[0]);
    elem.removeClass('body', 'u-disable-scrolling');
  }
}

function addLoadingWindow() {
  const node = document.createElement('div');
  node.setAttribute('class', 'ibgsdk-element instabug-window');
  node.setAttribute('id', 'instabugLoading');
  node.setAttribute('style', 'display:none;');
  node.innerHTML = translate(loadingWindowView);
  document.body.appendChild(node);
}

function addThankYouPage() {
  const node = document.createElement('div');
  node.setAttribute('class', 'ibgsdk-element instabug-window');
  node.setAttribute('id', 'instabugThankYouPage');
  node.setAttribute('style', 'display:none;');
  node.innerHTML = translate(ThankyouView);
  document.body.appendChild(node);
}

function addDownloadExtensionWindow() {
  const node = document.createElement('div');
  node.setAttribute('class', 'ibgsdk-element instabug-window');
  node.setAttribute('id', 'extensionPopUp');
  node.setAttribute('style', 'display:none;');
  node.innerHTML = downloadExtensionView;
  document.body.appendChild(node);
}

function showSubmitView() {
  elem.hide('#instabugsdkerror');
  elem.show('#instabugLoadingMsg');
  elem.hide('#instabugLoading');
  elem.show('#instabugFormContainer');
}

function downloadExtension() {
  let url;
  const browserName = bugReport.getBrowserData().browserName;
  if (browserName.match(/safari/ig)) {
    url = 'https://s3.amazonaws.com/instabug-pro/extensions/safari.safariextz';
  } else if (browserName.match(/chrome/ig)) {
    url = 'https://chrome.google.com/webstore/detail/gbhnbcggjeokebhgalmgkbhkabpjmnda/';
  } else if (browserName.match(/firefox/ig)) {
    url = 'https://addons.mozilla.org/en-US/firefox/addon/instabug/';
  } else {
    url = false;
  }
  if (url) {
    window.open(url, '_blank');
  } else {
    const myWindow = window.open('', '_blank');
    myWindow.document.write(`<h1>${translation.current.browserNotSupported}</h1>`);
  }
}


/**
 * addReportButton - inserts sdk main button to page dom
 *
 */
function addReportButton() {
  const node = document.createElement('div');
  node.setAttribute('id', 'instabugSDK');
  node.innerHTML = '<a id="initInstaBugLink" onclick="ibgSdk.invoke()"></a>';
  document.body.appendChild(node);
}


/**
 * initBugreportViews - insert all bugs reporting views into page dom
 */
function initBugreportViews() {
  const instabugFormContainer = document.getElementById('instabugFormContainer');

  if (instabugFormContainer) return;

  addSubmitForm();
  addDownloadExtensionWindow();
  addLoadingWindow();
  addThankYouPage();
  if (!utils.isMobile()) {
    if (!extension.isInstalled()) {
      elem.show('#extensionPopUp');
    } else {
      extension.takeScreenShot();
    }
  }
}

module.exports = {
  addReportButton,
  initBugreportViews,
  resetAndClose,
  showSubmitView,
  downloadExtension,
};

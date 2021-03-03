/**
 * @module instabug-websdk
 */

/* eslint-disable no-console */
import views from './views';
import bugReport from './bugReport';
import element from './element';
import extension from './extension';
import translation from './translation';

require('./startup');

if (!document.doctype) {
  console.error('InstaBug Fatal Err: page has no doctype declared');
}

/**
 * initSDK - initialize the sdk, setting up the integration tokens with uploading services
 *
 * @param  {type} options initialization object, this contains, zapier webhook url, cloudinary
 * integration data including `cloudName` and  `uploadPreset` token.
 * You can set html2canvas property to the html2canvas library as fallback method.
 */
function initSDK(options) {
  if (
    !options
    || !options.zapierWebhookUrl
    || !(options.cloudinaryCloudName && options.cloudinaryUploadPreset)
  ) {
    console.error('Instabug WebSDK: We can\'t find all integration information,'
    + ' sending bug report may not work as expected');
    return false;
  }

  if (options.zapierWebhookUrl) {
    bugReport.setZapierHookUrl(options.zapierWebhookUrl);
  } else {
    console.error('Instabug WebSDK: Zapier webhook url is not found');
  }

  if (options.cloudinaryCloudName && options.cloudinaryUploadPreset) {
    bugReport.setCloudinaryIntegration(options.cloudinaryCloudName, options.cloudinaryUploadPreset);
  } else {
    console.error('Instabug WebSDK: Cloudinary integration info are not found');
  }

  if (options.noLocalStorage) {
    bugReport.disableLocalStorage();
  }

  if (options.translation) {
    translation.current = options.translation;
  }

  bugReport.setLogSource(options.logSource);

  if (options.html2canvas) {
    extension.setHtml2canvas(options.html2canvas);
  }
  extension.offerDownloadPlugin = options.offerDownloadPlugin;
  extension.descriptionMaxLength = options.descriptionMaxLength;

  document.body.addEventListener('keydown', (e) => {
    if (e.which === 85 && e.ctrlKey) {
      e.preventDefault();
      sdk.invoke();
    }
  });

  setInterval(() => {
    if (document.activeElement === null) { // IE fix
      document.body.focus();
    }
  }, 100);
}


/**
 * disableSDK - hide sdk button
 */
function disableSDK() {
  element.addClass('#instabugSDK', 'u-hide');
}


/**
 * enableSDK - show sdk button
 */
function enableSDK() {
  element.removeClass('#instabugSDK', 'u-hide');
}


/**
 * continueWithoutScreenshot - continue using sdk without taking screenshot
 */
function continueWithoutScreenshot() {
  if (element.isExisted('#extensionPopUp')) {
    element.hide('#extensionPopUp');
  }

  if (element.isExisted('#instabugFormContainer')) {
    element.show('#instabugFormContainer');
  }
}


/**
 * IbgSdk - main Instabug SDK Object
 */
function IbgSdk() {
  return {
    init: initSDK,
    enable: enableSDK,
    disable: disableSDK,
    dismiss: views.resetAndClose,
    invoke: views.initBugreportViews,
    resetAndClose: views.resetAndClose,
    continue: continueWithoutScreenshot,
    showSubmitView: views.showSubmitView,
    submitReport: bugReport.submitBugReport,
    downloadExtension: views.downloadExtension,
  };
}

window.InstabugSDK = IbgSdk;
const sdk = new IbgSdk();
window.ibgSdk = sdk;

module.exports = {
  instabugSdk: IbgSdk,
};

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

function isUploadable(file) {
  return file.name.match(/\.(png|gif|jpg|bmp|pdf)$/i) && file.size <= 10485760;
}

const instabugWindow = createDraggableDiv();
document.body.appendChild(instabugWindow);

function addSubmitForm() {
  const node = document.createElement('div');

  node.setAttribute('class', 'ibgsdk-element instabug-window instabug-form');
  node.setAttribute('id', 'instabugFormContainer');
  node.style.display = 'none';

  node.innerHTML = translate(submitFormView);
  instabugWindow.appendChild(node);
  const extraImage = document.getElementById('extra-image');
  extraImage.addEventListener('change', () => {
    const fileError = extraImage.files.length && !isUploadable(extraImage.files[0]);
    document.getElementById('extra-image-error').style.display = fileError ? '' : 'none';
  });
  const comment = document.getElementById('comment');
  comment.addEventListener('input', () => {
    const valid = comment.value.length > 0;
    document.getElementById('submit-bugreport').disabled = !valid;
  });
  if (extension.pluginIsInstalled()) {
    elem.hide('#download-instabug-plugin');
  }
}

function resetAndClose() {
  while (document.getElementsByClassName('ibgsdk-element').length) {
    const element = document.getElementsByClassName('ibgsdk-element')[0];
    element.parentNode.removeChild(element);
    elem.removeClass('body', 'u-disable-scrolling');
  }
}

function addLoadingWindow() {
  const node = document.createElement('div');
  node.setAttribute('class', 'ibgsdk-element instabug-window');
  node.setAttribute('id', 'instabugLoading');
  node.setAttribute('style', 'display:none;');
  node.innerHTML = translate(loadingWindowView);
  instabugWindow.appendChild(node);
}

function addThankYouPage() {
  const node = document.createElement('div');
  node.setAttribute('class', 'ibgsdk-element instabug-window');
  node.setAttribute('id', 'instabugThankYouPage');
  node.setAttribute('style', 'display:none;');
  node.innerHTML = translate(ThankyouView);
  instabugWindow.appendChild(node);
}

function addDownloadExtensionWindow() {
  const node = document.createElement('div');
  node.setAttribute('class', 'ibgsdk-element instabug-window');
  node.setAttribute('id', 'extensionPopUp');
  node.setAttribute('style', 'display:none;');
  node.innerHTML = downloadExtensionView;
  instabugWindow.appendChild(node);
}

function showSubmitView() {
  elem.hide('#instabugsdkerror');
  elem.show('#instabugLoadingMsg');
  elem.hide('#instabugLoading');
  elem.show('#instabugFormContainer');
}

function downloadExtension(event) {
  event.preventDefault();
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
    myWindow.document.close();
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
  instabugWindow.appendChild(node);
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

function createDraggableDiv() {
  const div = document.createElement('div');

  let lastCursorX;
  let lastCursorY;

  div.style.position = 'fixed';
  div.style.zIndex = 1190000000;
  div.onmousedown = dragMouseDown;
  div.style.cursor = 'move';
  div.style.left = '360px';
  div.style.top = '100px';

  div.style.width = '340px';

  return div;

  function dragMouseDown(e) {
    const tagName = e.target.tagName;
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'BUTTON') {
      return;
    }

    e.preventDefault();
    // get the mouse cursor position at startup:
    lastCursorX = e.clientX;
    lastCursorY = e.clientY;
    document.addEventListener('mouseup', closeDragElement);
    document.addEventListener('mousemove', elementDrag);
  }

  function elementDrag(e) {
    e.preventDefault();
    const moveX = lastCursorX - e.clientX;
    const moveY = lastCursorY - e.clientY;
    lastCursorX = e.clientX;
    lastCursorY = e.clientY;

    const targetX = div.offsetLeft - moveX;
    const targetY = div.offsetTop - moveY;

    const newX = Math.max(0, Math.min(window.innerWidth - 338, targetX));
    const newY = Math.max(0, Math.min(window.innerHeight - 100, targetY));
    lastCursorX += (newX - targetX);
    lastCursorY += (newY - targetY);

    div.style.left = `${newX}px`;
    div.style.top = `${newY}px`;
  }

  function closeDragElement() {
    document.removeEventListener('mouseup', closeDragElement);
    document.removeEventListener('mousemove', elementDrag);
  }
}

module.exports = {
  addReportButton,
  initBugreportViews,
  resetAndClose,
  showSubmitView,
  downloadExtension,
};

/**
 * @module instabug-websdk/extension
 */

import element from './element';
import annotation from './annotations';

/**
 * setHtml2canvas - sets the html2canvas library as fallback screenshot captor method
 */
let html2canvas;
function setHtml2canvas(h2c) {
  html2canvas = h2c;
}

/**
 * isInstalled - check if the web browser extension or html2canvas is installed or not
 *
 * @return {bool}
 */
function isInstalled() {
  if (html2canvas) {
    return true;
  }
  return pluginIsInstalled();
}

/**
 * pluginIsInstalled - check if the web browser extension is installed or not
 *
 * @return {bool}
 */
function pluginIsInstalled() {
  return (document.getElementById('instabugSDK').getAttribute('plugin'));
}

function showScreenshot(image) {
  annotation.init();
  annotation.renderScreenshot(image);
}

/**
 * takeScreenShot
 * If plugin is installed, dispath the `takeScreenShot` event - this event logic is
 * already defined in instabug webbrowser extension.
 * If html2canvas is installed, use it to take screenshot
 */
function takeScreenShot() {
  if (pluginIsInstalled()) {
    const event = document.createEvent('Event');
    event.initEvent('takeScreenShot', true, true);
    document.dispatchEvent(event);
  } else if (html2canvas) {
    html2canvas(document.body, { type: 'view' }).then((canvas) => {
      element.addClass('body', 'u-disable-scrolling');
      showScreenshot(canvas);
    });
  }
}

document.addEventListener('screenShotCreated', () => {
  showScreenshot(document.getElementById('instabugImage').value);
  document.getElementById('instabugImage').remove();
});

module.exports = {
  isInstalled,
  pluginIsInstalled,
  takeScreenShot,
  setHtml2canvas,
};

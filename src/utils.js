/* eslint-disable no-useless-escape, no-console */


/**
 * @module instabug-websdk/utils
 */

/**
 * shortifyTime - remove miliseconds from timestamp
 *
 * @param  {number} time time in miliseconds
 * @return {number} time value after removing miliseconds digits
 */
function shortifyTime(time) {
  return Math.floor(time / 1000);
}


/**
 * isMobile - checks if the current window is displayed on mobile or not, based on viewport size
 *
 * @return {bool}  returns true if viewport is less than 767px or flase if larger than or equal
 */
function isMobile() {
  let returnVal = false;
  if (window.matchMedia) {
    returnVal = window.matchMedia('(max-width: 767px)').matches;
  } else {
    console.error('Your browser don\'t support matchMedia method');
  }
  return returnVal;
}

/**
 * sanitizeEmail - sanitize email address
 *
 * @param  {string} emailStr email to be sanirized
 * @return {string} email address after sanitizing, or empty string if no email presented in the
 * input string
 */
function sanitizeEmail(emailStr) {
  const re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  const extractedEmail = re.exec(emailStr);
  return (extractedEmail) ? extractedEmail[0] : '';
}

/**
 * dataURItoBlob - converts base64 image into binary image
 *
 * @param  {byteString} dataURI base64 encoded image
 * @return {object} same image after converted into binary
 */
function dataURItoBlob(dataURI) {
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = window.unescape(dataURI.split(',')[1]);
  }

  // separate the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}

function assign(target, ...rest) {
  const to = Object(target);

  for (let index = 0; index < rest.length; index++) {
    const nextSource = rest[index];
    if (nextSource != null) {
      const keys = Object.keys(nextSource);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (Object.prototype.hasOwnProperty.call(nextSource, key)) {
          to[key] = nextSource[key];
        }
      }
    }
  }
  return to;
}

module.exports = {
  assign,
  shortifyTime,
  isMobile,
  sanitizeEmail,
  dataURItoBlob,
};

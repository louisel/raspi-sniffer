chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('content script received message');
  var domain = null;
  document.addEventListener('mousedown', clickFunction, false);
  if (domain != null) {
    sendResponse({ res: 'SUCCESS', domain: domain });
  } else {
    sendResponse({ res: 'FAILURE' });
  }
});

/** Selects dom of element selected and hides the element.
 *  Gets the subdomain of source if the selected element is
 *  an image.
 *  Removes the event listener so the function will only fire
 *  once (i.e. clicking to delete an element only occurs once after
 *  the after the chrome runtime message is received).
 * */
var clickFunction = function(event) {
  var target = event.target;
  console.log(target);
  if (target.tagName.toLowerCase() === 'img') {
    console.log('is image');
    domain = getDomain(target);
  }
  hideElement(target);
  document.removeEventListener('mousedown', clickFunction, false);
};

function getDomain(img) {
  var pattern = /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i,
    domain = null;
  var src = img.src,
    matches = src.match(pattern),
    domain = matches && matches[1];
  console.log(domain);
  return domain;
}

function hideElement(target) {
  target.style.display = 'none';
}

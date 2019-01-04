//document.body.style.background = 'yellow';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('content script received message');
  var domain = null;
  document.addEventListener('mousedown', function(e) {
    var target = e.target;
    console.log(target);
    if (target.tagName.toLowerCase() === 'img') {
      console.log('is image');
      domain = getDomain(target);
    }
    hideElement(target);
  });
  if (domain != null) {
    sendResponse({ res: 'SUCCESS', domain: domain });
  } else {
    sendResponse({ res: 'FAILURE' });
  }
});

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

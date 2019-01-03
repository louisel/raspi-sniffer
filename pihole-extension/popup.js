/*let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function(data) {
    changeColor.style.backgroundColor = data.color;
    changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function(element) {
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
          tabs[0].id,
          {code: 'document.body.style.backgroundColor = "' + color + '";'});
    });
};*/

window.onload = function() {
  console.log('loaded');
  console.log(document.getElementById('admin'));
  let adminBtn = document.getElementById('admin');
  adminBtn.addEventListener('click', adminClick);
  document.getElementById('settings').addEventListener('click', settingsClick);
};

function adminClick() {
  console.log('clicked');
  var newUrl = 'http://192.168.0.11/admin'; //TODO: get ip from settings
  //chrome.tabs.create({ url: newUrl });
  window.open(newUrl);
}

function settingsClick() {
  chrome.runtime.openOptionsPage();
}

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
  //var API_KEY = chrome.localStorage.getItem("API_KEY");
  var API_KEY = 'to get';
  let adminBtn = document.getElementById('admin');
  adminBtn.addEventListener('click', adminClick);
  let powerBtn = document.getElementById('power');
  powerBtn.addEventListener('click', () => {
    powerClick(API_KEY, powerBtn.value);
  });
  let settingsBtn = document.getElementById('settings');
  settingsBtn.addEventListener('click', settingsClick);
};

function adminClick() {
  console.log('clicked');
  var newUrl = 'http://192.168.0.11/admin'; //TODO: get ip from settings
  //chrome.tabs.create({ url: newUrl });
  window.open(newUrl);
}

function powerClick(API_KEY, val) {
  var httpRes = new XMLHttpRequest();
  var url = 'http://pi.hole/admin/api.php?';
  var activate = val == 'ON' ? 'disable' : 'enable';
  url = url + activate + '&auth=' + API_KEY;
  console.log(url);
  httpRes.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      res = JSON.parse(this.response);
      toggleIcon(res);
    }
  };
  httpRes.open('GET', url, true);
  httpRes.send();
}

function toggleIcon(res) {
  if (res.status == 'disabled') {
    console.log('pi is disabled');
  } else if (res.status == 'enabled') {
    console.log('enabled');
  } else {
    console.log('something went wrong');
  }
}

function settingsClick() {
  chrome.runtime.openOptionsPage();
}
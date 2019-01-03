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
  var apiKey = null;
  var piholeAddr = null;
  chrome.storage.local.get(null, function(result) {
    apiKey = result.apikey;
    pihole = result.piholeAddr;
  });
  let adminBtn = document.getElementById('admin');
  adminBtn.addEventListener('click', () => {
    adminClick(piholeAddr);
  });
  let powerBtn = document.getElementById('power');
  powerBtn.addEventListener('click', () => {
    powerClick(apiKey, powerBtn.value);
  });
  let settingsBtn = document.getElementById('settings');
  settingsBtn.addEventListener('click', settingsClick);
};

function adminClick(ipAddr) {
  var newUrl = 'http://' + ipAddr + '/admin';
  window.open(newUrl);
}

function powerClick(apiKey, val) {
  var httpRes = new XMLHttpRequest();
  var url = 'http://pi.hole/admin/api.php?';
  var activate = val == 'ON' ? 'disable' : 'enable';
  url = url + activate + '&auth=' + apiKey;
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
  let powerImg = document.getElementGetId('power-img');
  let powerBtn = document.getElementGetId('power');
  if (res.status == 'disabled') {
    console.log('pi is disabled');
    powerBtn.value = 'OFF';
    powerImg.src = '../images/unchecked18.png';
  } else if (res.status == 'enabled') {
    console.log('enabled');
    powerBtn.value = 'ON';
    powerImg.src = '../images/checked18.png';
  } else {
    console.log('something went wrong');
  }
}

function settingsClick() {
  chrome.runtime.openOptionsPage();
}

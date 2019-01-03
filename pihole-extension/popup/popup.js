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
  let adminBtn = document.getElementById('admin');
  adminBtn.addEventListener('click', adminClick);
  let powerBtn = document.getElementById('power');
  powerBtn.addEventListener('click', () => {
    powerClick(powerBtn.value);
  });
  let settingsBtn = document.getElementById('settings');
  settingsBtn.addEventListener('click', settingsClick);
};

function adminClick() {
  var piholeAddr = '192.168.0.11';
  /*chrome.storage.local.get(null, function(result) {
    piholeAddr = result.piholeaddr;
  });*/
  var newUrl = 'http://' + piholeAddr + '/admin';
  window.open(newUrl);
}

function powerClick(val) {
  var apiKey = null;
  chrome.storage.local.get(null, function(result) {
    apiKey = result.apikey;
  });
  var xhr = new XMLHttpRequest();
  var url = 'http://pi.hole/admin/api.php?';
  var activate = val == 'ON' ? 'disable' : 'enable';
  url = url + activate + '&auth=' + apiKey;
  //url = "https://google.com";
  console.log(url);
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      res = JSON.parse(this.response);
      togglePower(res);
    }
  };
  xhr.open('GET', url, true);
  xhr.send();
}

function togglePower(res) {
  let powerImg = document.getElementById('power-img');
  let powerBtn = document.getElementById('power');
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

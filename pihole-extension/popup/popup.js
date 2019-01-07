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
  let zapperBtn = document.getElementById('zapper');
  zapperBtn.addEventListener('click', zapperClick);
};

function adminClick() {
  chrome.storage.local.get(null, function(result) {
    var piholeAddr = result.piholeaddr;

    var newUrl = 'http://' + piholeAddr + '/admin';
    window.open(newUrl);
  });
}

function powerClick(isActivated) {
  chrome.storage.local.get(null, function(result) {
    var piholeAddr = result.piholeaddr;
    var apiKey = result.apikey;
    setPower(piholeAddr, isActivated, apiKey);
  });
}

//TODO: split API calls into a separate file?
function setPower(piholeAddr, isActivated, apiKey) {
  var xhr = new XMLHttpRequest();
  var url = 'http://' + piholeAddr + '/admin/api.php?';
  var activate = isActivated == 'ON' ? 'disable=0' : 'enable';
  url = url + activate + '&auth=' + apiKey;
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var res = JSON.parse(this.response);
      console.log(res);
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
    console.log(res.status);
    console.log('something went wrong');
  }
}

function settingsClick() {
  chrome.runtime.openOptionsPage();
}

function getElement() {
  var target = null;
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.executeScript(tabs[0].id, {
      code: `
             document.addEventListener("click", function(e) {
               e = e || window.event;
               target = e.target || e.srcElement;
               console.log(target);
               //text = target.textContent || target.innerText;
            }, false);
           `
    });
  });
  console.log(target);
  return target;
}

function addToBlacklist(target) {
  chrome.storage.local.get(null, function(result) {
    var pwd = result.login;
    var piholeAddr = result.piholeaddr;
    addToList(result.piholeAddr, 'black', target, pwd);
  });
}

/**
 * Adds to a white or blacklist
 * listType should be 'black', 'white'
 * TODO: listType as wild, regex or audit? See https://github.com/pi-hole/AdminLTE/blob/master/scripts/pi-hole/php/add.php
 */
function addToList(piholeAddr, listType, domain, password) {
  var url = 'http://' + piholeAddr + '/admin/scripts/pi-hole/php/add.php';
  var data = 'list=' + listType + '&domain=' + domain + '&pw=' + password;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log('successfully removed');
      console.log(this.response);
      //remove element from dom, set to hidden
    }
  };
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send(data);
}

function zapperClick() {
  console.log('zapper is clicked');
  chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
      console.log(response);
      var resp = JSON.stringify(response);
      if (resp.res == 'SUCCESS') {
        addToBlackList(resp.domain);
      } else {
        //What to do?
      }
    });
  });
}

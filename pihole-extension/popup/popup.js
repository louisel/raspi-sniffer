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
  var piholeAddr = '192.168.0.11';
  var pwd = null;
  /*chrome.storage.local.get(null, function(result) {
     apiKey = result.apikey;
     piholeAddr = result.piholeaddr;
   });*/
  var url = 'http://' + piholeAddr + '/admin/scripts/pi-hole/php/add.php';
  var list = 'black';
  var data = 'list=' + list + '&domain=' + domain + '&pw=' + pwd;
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
  //var target = getElement();
  console.log('zapper is clicked');
  /*chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
      console.log("message from background: " + JSON.stringify(response))
    });
  }); */
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
//chrome.tabs.executeScript( null, {code:"var x = 10; x"},
//function(results){ console.log(results); } );

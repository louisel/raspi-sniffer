window.onload = function() {
  loadValues();
  document.getElementById('saveBtn').addEventListener('click', saveValues);
};

function loadValues() {
  chrome.storage.local.get(null, function(result) {
    let login = result.login;
    if (login != null) {
      document.getElementById('login').defaultValue = login;
    }
    let apiKey = result.apiKey;
    if (apiKey != null) {
      document.getElementById('apiKeyText').defaultValue = apiKey;
    }
    let piholeAddr = result.piholeAddr;
    if (piholeAddr != null)
      document.getElementById('piholeAddrText').defaultValue = piholeAddr;
  });
}

function saveValues() {
  chrome.storage.local.set({
    login: document.getElementById('login').value,
    apiKey: document.getElementById('apiKeyText').value,
    piholeAddr: document.getElementById('piholeAddrText').value
  });
}

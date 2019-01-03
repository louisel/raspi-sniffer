window.onload = function() {
  loadValues();
  document.getElementById('saveBtn').addEventListener('click', saveValues);
};

function loadValues() {
  chrome.storage.local.get(null, function(result) {
    let apiKey = result.apikey;
    if (apiKey != null) {
      document.getElementById('apiKeyText').defaultValue = apiKey;
    }
    let routerAddr = result.routeraddr;
    if (routerAddr != null)
      document.getElementById('routerAddrText').defaultValue = routerAddr;
  });
}

function saveValues() {
  chrome.storage.local.set({
    apikey: document.getElementById('apiKeyText').value,
    routeraddr: document.getElementById('routerAddrText').value
  });
}

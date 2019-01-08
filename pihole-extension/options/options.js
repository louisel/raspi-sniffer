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
    let piholeAddr = result.piholeAddr;
    if (piholeAddr != null)
      document.getElementById('piholeAddrText').defaultValue = piholeAddr;
  });
}

async function saveValues() {
  let loginValue = document.getElementById('login').value;
  chrome.storage.local.set({
    login: loginValue,
    apiKey: await sha256(await sha256(loginValue)),
    piholeAddr: document.getElementById('piholeAddrText').value
  });
}

// Taken from https://jameshfisher.com/2017/10/30/web-cryptography-api-hello-world.html
async function sha256(str) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder('utf-8').encode(str)
  );
  return Array.prototype.map
    .call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2))
    .join('');
}

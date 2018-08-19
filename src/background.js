var worker = new Worker(chrome.runtime.getURL('keyword-worker.js'));

chrome.extension.onConnect.addListener(function(port) {
  worker.onmessage = (event) => {
    port.postMessage(event.data);
  };
  port.onMessage.addListener(function(msg) {
    worker.postMessage(msg);
  });
});

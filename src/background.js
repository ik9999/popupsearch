var worker = new Worker(chrome.runtime.getURL('keyword-worker.js'));

chrome.extension.onConnect.addListener(function(port) {
  worker.onmessage = (event) => {
    port.postMessage(event.data);
  };
  port.onMessage.addListener(function(msg) {
    worker.postMessage(msg);
  });
});

chrome.storage.local.get(['keepHistoryDays'], function(items) {
  let keepHistoryDays = window.parseInt(items.keepHistoryDays);
  if (keepHistoryDays !== 0 && !keepHistoryDays) {
    keepHistoryDays = 120;
  }
  console.log(keepHistoryDays);
  if (keepHistoryDays !== 0) {
    console.log({
      type: 'clear_db',
      keepHistoryDays 
    });
    worker.postMessage({
      type: 'clear_db',
      keepHistoryDays 
    });
    setInterval(() => {
      worker.postMessage({
        type: 'clear_db',
        keepHistoryDays 
      });
    }, 60000*60*2)
  }
});

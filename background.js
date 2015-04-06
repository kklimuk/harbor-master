chrome.storage.sync.get('harbor-master-token', function (items) {
    if (!('harbor-master-token' in items)) {
        chrome.tabs.create({url: chrome.extension.getURL('background.html')});
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, condition) {
    if (condition.status === 'complete') {
        chrome.storage.sync.get('harbor-master-token', function (items) {
            if ('harbor-master-token' in items) {
                var code = 'var injected = window.harborMasterInjected; window.harborMasterInjected = true;';
                code += 'typeof window.onstatechange === "function" ? window.onstatechange(window.location.pathname) : null;';
                code += 'window.HARBOR_MASTER_TOKEN = "' + items['harbor-master-token'] + '";';
                code += 'injected';

                chrome.tabs.executeScript(tabId, {
                    code: code,
                    runAt: 'document_start'
                }, function (res) {
                    if (chrome.runtime.lastError || res[0]) {
                        return;
                    }

                    chrome.tabs.executeScript(tabId, {file: 'index.js', runAt: 'document_end'}, function () {
                        console.log('index.js loaded into the system');
                    });
                });
            }
        });
    }
});
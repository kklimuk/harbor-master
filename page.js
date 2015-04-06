document.querySelector('button').addEventListener('click', function () {
    if (window.token.value) {
        chrome.storage.sync.set({
            'harbor-master-token': window.token.value
        }, function () {
            chrome.tabs.getCurrent(function (tab) {
                chrome.tabs.remove(tab.id);
            });
        });
    }
});
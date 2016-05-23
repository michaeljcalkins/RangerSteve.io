function fetchUserCount() {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "https://rangersteve.io/api/v1/users/count", false)
    xhr.send()

    var result = xhr.responseText;

    chrome.browserAction.setBadgeText({
        text: result
    })

    setTimeout(function() {
        fetchUserCount()
    }, 60 * 5)
}

chrome.browserAction.onClicked.addListener(function(activeTab){
    var newURL = "https://rangersteve.io/game";
    chrome.tabs.create({ url: newURL });
})

fetchUserCount()

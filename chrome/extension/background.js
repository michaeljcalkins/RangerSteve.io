function fetchUserCount() {
    var xhr = new XMLHttpRequest()

    xhr.open("GET", "https://rangersteve.io/api/v1/users/count", false)
    xhr.send()

    var result = xhr.responseText;

    chrome.browserAction.setBadgeText({
        text: result
    })
}

fetchUserCount()

setInterval(function() {
    fetchUserCount()
}, 60000)

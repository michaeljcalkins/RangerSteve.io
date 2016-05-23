var fetchUserCountHandle = null

function fetchUserCount() {
    clearTimeout(fetchUserCountHandle)
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "https://rangersteve.io/api/v1/users/count", false)
    xhr.send()

    var result = xhr.responseText;

    chrome.browserAction.setBadgeText({
        text: result
    })

    fetchUserCountHandle = setTimeout(function() {
        fetchUserCount()
    }, 60000)
}

fetchUserCount()

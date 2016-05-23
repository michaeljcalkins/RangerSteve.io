// chrome.browserAction.setBadgeBackgroundColor({
//     color: '#00abff'
// })

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
    }, 10000)
}

fetchUserCount()

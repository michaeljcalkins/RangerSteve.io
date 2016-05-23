function fetchUserCount() {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "https://rangersteve.io/api/v1/users/count", false)
    xhr.send()

    var result = xhr.responseText

    document.getElementById('player-counter').innerHTML = result
}

document.addEventListener('DOMContentLoaded', function () {
    fetchUserCount()
    var backGround = chrome.extension.getBackgroundPage();
    backGround.fetchUserCount();
})

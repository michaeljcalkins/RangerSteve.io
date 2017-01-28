// Creates a Web Worker
var worker = new window.Worker('/js/idlePlayerDetectionWorker.js')

// Triggered by postMessage in the Web Worker
worker.onmessage = function (evt) {
  // When a message is sent back that means the player has been idle for X amount of seconds
  document.location.href = '/'
}

// If the Web Worker throws an error
worker.onerror = function (evt) {
  console.error(evt.data)
}

export default function () {
  worker.postMessage(null)

  // These postMessage's work like a ping to run the debouce function that is run in the background
  window.onload = () => { worker.postMessage(null) }
  document.onmousemove = () => { worker.postMessage(null) }
  document.onkeypress = () => { worker.postMessage(null) }
}

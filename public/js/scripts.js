/**
 * Prevent our site from being iframed
 */
if (window.self !== window.top) {
  window.top.location = window.location // redirect the window to our website
}

/**
 * Prevent our site from being iframed
 */
export default function () {
  if (
    window.self === window.top ||
    window.top.location.href.indexOf('iogames.space') > -1
  ) return

  window.top.location = window.location // redirect the window to our website
}

import GameConsts from 'lib/GameConsts'

/**
 * Prevent our site from being iframed
 */
export default function () {
  const matchingHrefs = GameConsts.ALLOWED_IFRAME_DOMAINS.filter(keyword => window.top.location.href.indexOf(keyword) > -1)
  if (
    window.self === window.top || // Player is on our domain *.rangersteve.io
    matchingHrefs.length === 1 // Player is playing through an iframe on an allowed domain
  ) return

  window.top.location = window.location // redirect the window to our website
}

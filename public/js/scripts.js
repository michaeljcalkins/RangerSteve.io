/**
 * Prevent our site from being iframed
 */
if (window.self !== window.top) {
    top.location = window.location // redirect the window to our website
}

/**
 * Turbolinks
 */
Turbolinks.start()

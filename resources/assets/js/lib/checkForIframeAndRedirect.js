/**
 * Prevent our site from being iframed
 */
export default function() {
    if (window.self !== window.top) {
        top.location = window.location // redirect the window to our website
    }
}

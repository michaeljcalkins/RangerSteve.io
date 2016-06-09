import store from 'store'

export default function(data) {
    if (data.id !== ('/#' + window.socket.id))
        return

    store.set('banned', true)
    window.location = 'https://www.google.com'
}

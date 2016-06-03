import store from 'store'

export default function(data) {
    if (data.id !== ('/#' + this.socket.id))
        return

    store.set('banned', true)
    window.location = '/'
}

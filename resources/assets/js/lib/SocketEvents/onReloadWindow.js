export default function(data) {
    console.log('reload')
    if (data.id === ('/#' + window.socket.id)) return
    window.location.reload()
}

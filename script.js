
document.addEventListener('DOMContentLoaded', async () => {
    const connections = {}
    const peer = new Peer()
    let localStream = null
    const socket = io('https://minimal-vc-server-production.up.railway.app/')
    const user = JSON.parse(localStorage.getItem('user'))
    peer.on('open', id => {
        document.getElementById('create').addEventListener('click', () =>{
            const room = document.getElementById('room').value.trim()
            socket.emit('join:room', {room, socketId: socket.id ,peerId: id, host: true})
            localStorage.setItem('user', JSON.stringify({room, socketId: socket.id, peerId: id, host: true}))

        })       
         document.getElementById('join').addEventListener('click', () =>{
            const room = document.getElementById('room').value.trim()
            socket.emit('join:room', {room, socketId: socket.id , peerId: id, host: false})
            localStorage.setItem('user', JSON.stringify({room, socketId: socket.id, peerId: id, host: false}))

        })
    })
 
        socket.on('user:connected', ({peerId, socketId, host}) => {
            if (!connections[peerId]) {
                connections[peerId] = {}
            }
            connections[peerId] = {peerId, socketId, host}
         
            if (user.host === true) {
                const conn = peer.connect(peerId)
                console.log('connection send')
                const call = peer.call(peerId, localStream)
                call.on('stream', remoteStream => {
                    const remoteVideo = document.createElement('video')
                    remoteVideo.srcObject = remoteStream
                    remoteVideo.autoplay = true
                })
            }
            
        })

        peer.on('connection', conn => {
            conn.on('open', ()=> console.log('connection received'))
            conn.on('data', data => console.log(data))
        })

        peer.on('call' , call =>{
            call.answer(localStream)
              call.on('stream', remoteStream => {
                    const remoteVideo = document.createElement('video')
                    remoteVideo.srcObject = remoteStream
                    remoteVideo.autoplay = true
                    document.body.appendChild(remoteVideo)
                })
                  

        })
    
    try {
        const media = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        const localvideo = document.createElement('video')
        localvideo.srcObject = media
        localvideo.muted = true
        localvideo.autoplay = true
        localStream = media
        document.body.appendChild(localvideo)
    } catch (error) {
        console.log(error.message)
    }
})
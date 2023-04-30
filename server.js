const path = require('path'),
      express = require('express'),
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io')(server, {
        cors: { origin: "http://localhost:3000", methods: ["GET", "POST", "websocket"] }
      }),

      ACTION = require('./src/socket/actions'),
      PORT = process.env.PORT || 3001;

const getClientRooms = () => {
  const { rooms } = io.sockets.adapter;
  return Array.from(rooms.keys());
}

const shareRoomsInfo = () => {
  io.emit(ACTION.SHARE_ROOMS, {
    rooms: getClientRooms()
  })
}

io.on('connection', socket => {
  shareRoomsInfo();
  socket.on(ACTION.JOIN, config => {
    const { room: roomID} = config;
    const {rooms: joinedRooms } = socket;
    if (Array.from(joinedRooms).includes(roomID)) {
      return console.warn(`Allready joined to ${roomID}`)
    }
    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);
    clients.forEach(clientID => {
      io.to(clientID).emit(ACTION.ADD_PEER, {
        //! ЗАКОНЧИЛ ЗДЕСЬ НА 24.20 
        peerID
      })
    });

  })
  console.log('Socket connected');
})

server.listen(PORT, () => {
  console.log('listner PORT: ' + PORT);
})

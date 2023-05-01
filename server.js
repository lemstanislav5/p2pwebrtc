//! ЗАКОНЧИЛ ЗДЕСЬ НА 28.41 
const path = require('path'),
      express = require('express'),
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io')(server, {
        cors: { origin: "http://localhost:3000", methods: ["GET", "POST", "websocket"] }
      }),
      ACTIONS = require('./src/socket/actions'),
      PORT = process.env.PORT || 3001;

const getClientRooms = () => {
  const { rooms } = io.sockets.adapter;
  return Array.from(rooms.keys());
}

const shareRoomsInfo = () => {
  console.log(ACTIONS)
  io.sockets.emit(ACTIONS.SHARE_ROOMS, {
    rooms: getClientRooms()
  })
}

io.on('connection', socket => {
  shareRoomsInfo();
  socket.on(ACTIONS.JOIN, config => {
    const { room: roomID} = config;
    const {rooms: joinedRooms } = socket;
    if (Array.from(joinedRooms).includes(roomID)) {
      return console.warn(`Allready joined to ${roomID}`)
    }
    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);
    clients.forEach(clientID => {
      io.to(clientID).emit(ACTIONS.ADD_PEER, {
        peerID: socket.id,
        createOffer: false
      });

      socket.emit(ACTIONS.ADD_PEER, {
        peerID: clientID,
        createOffer: true
      });
    });
    socket.join(roomID);
    shareRoomsInfo();
  });
  console.log('Socket connected');

  const leaveRoom = () => {
    const { rooms } = socket;
    Array.from(rooms)
      .forEach(roomID => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);
        clients.forEach(clientID => {
          io.ro(clientID).emit(ACTIONS.REMOVE_PEER, {
            peerID: clientID
          });
  
          socket.emit(ACTIONS.REMOVE_PEER, {
            peerID: socket.id
          });
        });
      
        socket.leave(roomID);
      });
    shareRoomsInfo();
  }
  
  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on('disconnect', leaveRoom)
});



server.listen(PORT, () => {
  console.log('listner PORT: ' + PORT);
})

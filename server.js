//! ЗАКОНЧИЛ ЗДЕСЬ НА 46.44
const path = require('path'),
      express = require('express'),
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io')(server, {
        cors: { origin: "http://localhost:3000", methods: ["GET", "POST", "websocket"] }
      }),
      ACTIONS = require('./src/socket/actions'),
      PORT = process.env.PORT || 3001,
      {version, validate} = require('uuid');

const getClientRooms = () => {
  const { rooms } = io.sockets.adapter;
  return Array.from(rooms.keys()).filter(roomID => validate(roomID) && version(roomID) === 4);
}

const shareRoomsInfo = () => {
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
          io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
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
  socket.on('disconnect', leaveRoom);

  socket.on(ACTIONS.RELAY_SDP, (peerID, sessionDiscription) => {
    io.to(peerID).emit(ACTIONS.SESSION_DISCRIPTION, {
      peerID: socket.id,
      sessionDiscription,
    })
  });

  socket.on(ACTIONS.RELAY_ICE, (peerID, iceCandidate) => {
    io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
      peerID: socket.id,
      iceCandidate,
    })
  });
});



server.listen(PORT, () => {
  console.log('listner PORT: ' + PORT);
})

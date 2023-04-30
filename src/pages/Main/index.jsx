import { useEffect, useState } from 'react';
import ACTIONS from '../../socket/actions';

import socket from '../../socket';

const Main = (props) => {
  const [rooms, updateRooms] = useState([]);
  useEffect(() => {
    socket.on(ACTIONS.SHARE_ROOMS, ({rooms = []} = {}) => {
      updateRooms(rooms);
    }, [])
  })

  return (
    <>
      <h1>Avalebale rooms</h1>
      <ul>
        { rooms.map(roomID => (
          <li>
            <p>{roomID}</p>
            <button>JOIN ROOM</button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default Main;

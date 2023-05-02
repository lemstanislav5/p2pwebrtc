import { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import ACTIONS from '../../socket/actions';
import {v4} from 'uuid';
import socket from '../../socket';

const Main = (props) => {
  const navigate = useNavigate();
  const [rooms, updateRooms] = useState([]);
  useEffect(() => {
    socket.on(ACTIONS.SHARE_ROOMS, (...args) => {
      const { rooms } = args[0];
      updateRooms(rooms);
    }, [])
  })

  return (
    <>
      <h1>Avalebale rooms</h1>
      <ul>
        { rooms.map(roomID => (
          <li key={roomID}>
            <span>{roomID}</span>
            <button>JOIN ROOM</button>
          </li>
        ))}
      </ul>
      <button onClick={() => {
        navigate(`/room/${v4()}`)
      }}>Create new room</button>
    </>
  )
}

export default Main;

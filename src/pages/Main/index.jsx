import { useEffect, useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import ACTIONS from '../../socket/actions';
import {v4} from 'uuid';
import socket from '../../socket';

const Main = (props) => {
  const navigate = useNavigate();
  const [rooms, updateRooms] = useState([]);
  const rootNode = useRef();
  useEffect(() => {
    socket.on(ACTIONS.SHARE_ROOMS, ({rooms = []} = {}) => {
      if (rootNode.current) {
        updateRooms(rooms);
      }
    }, [])
  })

  return (
    <div ref={rootNode}>
      <h1>Avalebale rooms</h1>
      <ul>
        { rooms.map(roomID => (
          <li key={roomID}>
            <span>{roomID}</span>
            <button onClick={() => {
              navigate(`/room/${roomID}`);
            }}>JOIN ROOM</button>
          </li>
        ))}
      </ul>
      <button onClick={() => {
        navigate(`/room/${v4()}`)
      }}>Create new room</button>
    </div>
  )
}

export default Main;

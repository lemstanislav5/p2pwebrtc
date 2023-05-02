import { useParams } from 'react-router-dom';
import useWebRTC from '../../hooks/useWebRTC'

const ACTIONS = require('../actions'),

const Room = (props) => {
  const {id: roomID} = useParams();

  useWebRTC(roomID);

  return (
    <h1>Room</h1>
  )
}

export default Room;

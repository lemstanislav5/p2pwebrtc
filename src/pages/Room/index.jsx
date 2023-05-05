import { useParams } from 'react-router-dom';
import useWebRTC, {LOCAL_VIDEO} from '../../hooks/useWebRTC'

import ACTIONS from '../../socket/actions';

const Room = (props) => {
  const {id: roomID} = useParams();

  const {clients, provideMediaRef} = useWebRTC(roomID);

  return (
    <div>
      {
        clients.map((clientID, i) => {
          return (
            <div key={clientID + i}>
              <video
                width='100%'
                height='100%'
                ref={instance => { provideMediaRef(clientID, instance) }}
                autoPlay
                playsInline
                muted={clientID === LOCAL_VIDEO}
              />
            </div>
          )
        })
      }
    </div>
  )
}

export default Room;

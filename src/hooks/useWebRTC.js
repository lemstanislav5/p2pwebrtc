import { useEffect, useRef, useCallback} from 'react';
// это простой способ получить случайный сервер STUN или TURN для вашего приложения WebRTC
import freeice from 'freeice';
import useStateWithCallback from './useStateWithCallback';
import socket from '../socket';
import ACTIONS from '../socket/actions';

export const LOCAL_VIDEO = 'LOCAL_VIDEO';


const useWebRTC = (roomID) => {
  // все доступныt клиенты
  const [clients, updateClients] = useStateWithCallback([]);

  // функция для приема нового клиента
  const addNewClient = useCallback((newClient, cb) => {
     updateClients(list => {
       if (!list.includes(newClient)) return [...list, newClient];
       return list;
     }, cb);
  }, [clients, updateClients]);

  // ссылка на все пир-коннекшены
  const peerConnections = useRef({});
  // ссылка на видео- и аудио-элемент, который будет транслироваться с веб камеры
  const localMediaStream = useRef(null);
  // ссылки на все пир-медиа элементы которые будут у нас на страницые
  const peerMediaElements = useRef({ [LOCAL_VIDEO]: null });

  useEffect(() => {
    const handleNewPeer = async ({peerID, createOffer}) => {

      if (peerID in peerConnections) return console.warn(`Already connected too peer ${peerID}`);

      peerConnections.current[peerID] = new RTCPeerConnection({
        // предоставляет набор адресов бесплатных стан-серверов
        iceServers: freeice(),
      });

      peerConnections.current[peerID].onicecandidate = event => {
        if (event.candidate) {
          socket.emit(ACTIONS.RELAY_ICE, {
            peerID,
            iceCandidate: event.candidate,
          })
        }
      }

      let trackNumber = 0;
      peerConnections.current[peerID].ontcack = ({streems: [remoteStream]}) => {
        trackNumber++;
        if(trackNumber === 2) { //video & audio tracks received
          addNewClient(peerID, () => {
            peerMediaElements.current[peerID].srcObject = remoteStream;
          });
        }
      }

      // вместо метода addStream в который можено сразу прокинуть localMediaStream, но он не кросбраузерный и не будет работать на мобильных устройствах
      localMediaStream.current.getTracks().forEach(track => {
        peerConnections.current[peerID].addTrack(track, localMediaStream.current);
      });

      if (createOffer) {
        const offer = await peerConnections.current[peerID].createOffer();

        await peerConnections.current[peerID].setLocalDescription(offer);

        socket.emit(ACTIONS.RELAY_SDP, {
          peerID,
          sessionDescription: offer,
        });
      }
    }

    socket.on(ACTIONS.ADD_PEER, handleNewPeer);
  }, [])

  useEffect(() => {
    const setRemoteMedia = async ({peerID, setLocalDiscription: remoteDiscription}) => {
      await peerConnections.current[peerID].setRemoteDiscription(
        new RTCSessionDescription(remoteDiscription)
      );
      if (remoteDiscription.type === 'offer') {
        const answer = await peerConnections.current[peerID].createAnswer();
        await peerConnections.current[peerID].setLocalDiscription(answer);
        socket.emit(ACTIONS.RELAY_SDP, {
          peerID,
          sessionDiscription: answer,
        })
      }
    }
    socket.on(ACTIONS.SESSION_DISCRIPTION, setRemoteMedia);
  }, []);

  useEffect(() => {
    socket.on(ACTIONS.ICE_CANDIDATE, ({peerID, iceCandidate}) =>{
      peerConnections.current[peerID].addIceCandidate(
        new RTCIceCandidate(iceCandidate)
      );
    });
  }, []);

  useEffect(() => {
    const handleRemovePeer = ({peerID}) => {
      if (peerConnections.current[peerID]) {
        peerConnections.current[peerID].close();
      }
      delete peerConnections.current[peerID];
      delete peerMediaElements.current[peerID];

      updateClients(list => list.filter(c => c !== peerID));
    };

    socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
  }, []);

  useEffect(() => {
    const startCapture = async () => {
      // захват медиаконтента как звука, так и видео
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 1280, height: 720 }
      });

      addNewClient(LOCAL_VIDEO, () => {
        const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];
        if (localVideoElement) {
          // 0 чтобы не слышать себя же
          localVideoElement.volume = 0;
          // захваченный с камеры и микрофона медиа-элемент передаем
          localVideoElement.srcObject = localMediaStream.current;
        }
      });
    }
    startCapture()
      .then(() => socket.emit(ACTIONS.JOIN, {room: roomID}))
      .catch(e => console.error('Error getting userMedia', e));

      return () => {
        //!localMediaStream.current - первоначальное значение NULL???
        if (localMediaStream.current) {
          //localMediaStream.current.getTracks() - возвращает все треки в виде массива
          localMediaStream.current.getTracks().forEach(track => track.stop());
          socket.emit(ACTIONS.LEAVE);
        }
      }
  }, [roomID]);

  const provideMediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node;
  }, []);
  return { clients, provideMediaRef };
}

export default useWebRTC;

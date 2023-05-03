import { useEffect, useRef, useCallback} from 'react';
//import freeice from 'freeice';
import useStateWithCallbacs from './useStateWithCallbacs';
import socket from '../socket';
import ACTIONS from '../socket/actions';

export const LOCAL_VIDEO = 'LOCAL_VIDEO';


const useWebRTC = (roomID) => {
  // все доступныt клиенты
  const [clients, updateClients] = useStateWithCallbacs([]);
  // ссылка на все пир-коннекшены
  const peerConnections = useRef({});
  // ссылка на видео- и аудио-элемент, который будет транслироваться с веб камеры
  const localMediaStream = useRef(null);
  // ссылки на все пир-медиа элементы которые будут у нас на страницые
  const peerMediaElements = useRef({
    [LOCAL_VIDEO]: null,
  });
  // функция для приема нового клиента
  const addNewClient = useCallback((newClient, cb) => {
     updateClients(list => {
      console.log(clients.includes(newClient))
       if (!clients.includes(newClient)) return [...list, newClient];
       return list;
     }, cb);
  }, [clients, updateClients]);

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
          console.log(localVideoElement.current)
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
  }, [roomID]);

  const provideMediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node;
  }, []);
  return { clients, provideMediaRef };
}

export default useWebRTC;

import { useEffect, useState, useRef} from 'react';
import useStateWithCallbacs from './useStateWithCallbacs'


const useWebRTC = (roomID) => {
  // все доступныt клиенты
  const [clients, updateClients] = useState([]);
  // ссылка на все пир-коннекшены
  const peerConnections = useRef({});
  // ссылка на видео- и аудио-элемент, который будет транслироваться с веб камеры
  const localMediaStream = useRef(null);
  // ссылки на все пир-медиа элементы которые будут у нас на страницые
  const peerMediaElements = useRef({});
  // функция для приема нового клиента
  const addNewClient = useCallback((newClient, cb) => {
    if (!clients.includes(newClient)) {
      updateClients(list => [...list, newClient], cd)
    }
  }, [clients, updateClients])

  useEffect(() => {
    const startCapture = async () => {
      localMediaStream.current = await navgator.mediaDivices.getUserMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720,
        }
      })

      addNewClient(LOCAL_VIDEO);
    }
    startCapture()
      .then(() => socket.emit(ACTIONS.JOIN, {room: roomID}))
      .catch(e => console.error('Error getting userMedia'));
  }, [roomID]);
}

export default useWebRTC;

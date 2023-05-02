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

  useEffect(() => {

  }, []);
}

export default useWebRTC;

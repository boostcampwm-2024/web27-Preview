import { useEffect } from "react";
import useSocketStore from "../stores/useSocketStore";

const socketURL = import.meta.env.VITE_SIGNALING_SERVER;

const useSocket = () => {
  const { socket, connect } = useSocketStore();

  useEffect(() => {
    if (!socket) {
      connect(socketURL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socket };
};

export default useSocket;

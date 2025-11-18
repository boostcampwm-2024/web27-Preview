import { useEffect, useRef } from "react";
import useSocketStore from "../stores/useSocketStore";

const socketURL = import.meta.env.VITE_SIGNALING_SERVER || "localhost:3000";

const useSocket = () => {
  const { socket, connect, disconnect } = useSocketStore();
  const connectAttempted = useRef(false);

  useEffect(() => {
    if (!socket && !connectAttempted.current) {
      connectAttempted.current = true;
      connect(socketURL);
    }

    return () => {
      connectAttempted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return { socket, disconnect };
};

export default useSocket;

import { useEffect, useRef, useState } from "react";
import { convertAmplitudeToDecibels, extractAudioLevelFromStats } from "./utils/covertToDecibels.ts";

interface UseAudioDetectorProps {
  localStream: MediaStream | null;
  peerConnections: React.MutableRefObject<{ [key: string]: RTCPeerConnection }>;
  audioThreshold?: number;
}

interface AudioLevels {
  [peerId: string]: boolean;
}

const CHECK_PEERCONNECTION_MS = 1000;
const TIMER_INTERVAL_MS = 100;

export const useAudioDetector = ({
  localStream,
  peerConnections,
  audioThreshold = -35,
}: UseAudioDetectorProps) => {
  const [speakingStates, setSpeakingStates] = useState<AudioLevels>({});
  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const audioContextRef = useRef<AudioContext | null>();
  const analyserRef = useRef<AnalyserNode | null>();
  const dataArrayRef = useRef<Uint8Array | null>();

  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    const checkConnections = setInterval(() => {
      const currentCount = Object.keys(peerConnections.current).length;
      if (currentCount !== connectionCount) {
        setConnectionCount(currentCount);
      }
    }, CHECK_PEERCONNECTION_MS);

    return () => clearInterval(checkConnections);
  }, [peerConnections, connectionCount]);

  useEffect(() => {
    if (!localStream) return;

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }
    analyserRef.current = audioContextRef.current.createAnalyser();

    analyserRef.current.fftSize = 2048;
    analyserRef.current.smoothingTimeConstant = 0.8;

    dataArrayRef.current = new Uint8Array(
      analyserRef.current.frequencyBinCount
    );

    const source = audioContextRef.current.createMediaStreamSource(localStream);
    source.connect(analyserRef.current);

    const checkLocalAudio = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const average =
        dataArrayRef.current.reduce((a, b) => a + b) /
        dataArrayRef.current.length;
      const db = convertAmplitudeToDecibels(average);

      setSpeakingStates((prev) => ({
        ...prev,
        local: db > audioThreshold,
      }));
    };

    intervalRefs.current.local = setInterval(checkLocalAudio, TIMER_INTERVAL_MS);

    // 각 피어에 대해 오디오 레벨 모니터링
    if (connectionCount > 0) {
      Object.entries(peerConnections.current).forEach(([peerId, connection]) => {
        clearInterval(intervalRefs.current[peerId]);
        intervalRefs.current[peerId] = setInterval(async () => {
          try {
            const stats = await connection.getStats();
            const audioLevel = extractAudioLevelFromStats(stats);

            setSpeakingStates((prev) => ({
              ...prev,
              [peerId]: audioLevel > audioThreshold,
            }));
          } catch (error) {
            console.error(error);
          }
        }, TIMER_INTERVAL_MS);
      });
    }

    return () => {
      Object.values(intervalRefs.current).forEach((interval) => {
        clearInterval(interval);
      });
      intervalRefs.current = {};

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [connectionCount, localStream, audioThreshold]);

  return { speakingStates };
};

const AUDIO_CONSTANTS = {
  MAX_AMPLITUDE: 255, // 오디오 데이터 최대 진폭값
  DECIBEL_CONVERSION_FACTOR: 20, // 진폭을 dB로 변환하는 계수
  SILENCE_LEVEL: -Infinity // 무음 상태의 데시벨 값
} as const;

export const convertAmplitudeToDecibels = (averageAmplitude: number) => {
  if (averageAmplitude === 0) return -Infinity;
  const normalizedAmplitude = averageAmplitude / AUDIO_CONSTANTS.MAX_AMPLITUDE;

  return AUDIO_CONSTANTS.DECIBEL_CONVERSION_FACTOR * Math.log10(normalizedAmplitude);
}

export const extractAudioLevelFromStats = (stats: RTCStatsReport) => {
  let audioLevel = -Infinity;

  stats.forEach((report) => {
    const isAudioInput = report.type === "inbound-rtp" && report.kind === "audio";

    if (isAudioInput && report.audioLevel) {
      audioLevel = AUDIO_CONSTANTS.DECIBEL_CONVERSION_FACTOR * Math.log10(report.audioLevel);
    }
  })

  return audioLevel;
}
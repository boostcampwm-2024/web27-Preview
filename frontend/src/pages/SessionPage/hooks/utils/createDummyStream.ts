export const createDummyStream = () => {
  const blackCanvas = document.createElement("canvas");
  blackCanvas.width = 640;
  blackCanvas.height = 480;
  const ctx = blackCanvas.getContext("2d");
  ctx!.fillRect(0, 0, blackCanvas.width, blackCanvas.height);

  const blackStream = blackCanvas.captureStream();
  const blackTrack = blackStream.getVideoTracks()[0];
  Object.defineProperty(blackTrack, "label", {
    value: "blackTrack",
    writable: false,
  });
  return blackTrack;
};
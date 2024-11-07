import React, { forwardRef } from "react";
import {
  BsMic,
  BsMicMute,
  BsCameraVideo,
  BsCameraVideoOff,
} from "react-icons/bs";

interface VideoContainerProps {
  nickname: string;
  isMicOn: boolean;
  isVideoOn: boolean;
}

const VideoContainer = forwardRef(
  (
    { nickname, isMicOn, isVideoOn }: VideoContainerProps,
    ref: React.Ref<HTMLVideoElement>
  ) => {
    return (
      <div className="bg-black rounded-2xl overflow-hidden shadow relative">
        <video ref={ref} autoPlay playsInline muted className="w-full" />
        <div className="inline-flex gap-4 absolute bottom-2 w-full justify-between px-2">
          <p className="bg-accent-gray  bg-opacity-50 text-white px-2 py-0.5 rounded">
            {nickname}
          </p>
          <div className={"inline-flex gap-4 px-2 items-center"}>
            {isMicOn ? (
              <BsMic className="text-white" />
            ) : (
              <BsMicMute className="text-red-500" />
            )}
            {isVideoOn ? (
              <BsCameraVideo className="text-white" />
            ) : (
              <BsCameraVideoOff className="text-red-500" />
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default VideoContainer;

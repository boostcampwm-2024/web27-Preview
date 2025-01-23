import {
  BsMic,
  BsMicMute,
  BsCameraVideo,
  BsCameraVideoOff,
} from "react-icons/bs";
import DisplayMediaStream from "./DisplayMediaStream.tsx";
import LoadingIndicator from "@components/common/LoadingIndicator.tsx";
import VideoProfileOverlay from "@components/session/VideoProfileOverlay.tsx";
import VideoReactionBox from "@components/session/VideoReactionBox.tsx";

interface VideoContainerProps {
  nickname: string;
  isMicOn: boolean;
  isVideoOn: boolean;
  isLocal: boolean;
  isSpeaking: boolean;
  reaction: string;
  stream: MediaStream | undefined;
  videoLoading?: boolean;
  videoCount: number;
}

const getVideoLayoutClass = (count: number) => {
  switch (count) {
    case 1:
      return "w-[calc(min(100%,((100vh-140px)*(4/3))))]";
    case 2:
      return `w-[calc(min(100%,((100vh-148px)*(2/3))))]
              sm:w-[calc(min(calc(50%-0.5rem),((100vh-140px)*(4/3))))]
             `;
    case 3:
      return `w-[calc(min(100%,((100vh-156px)*(4/9))))]
              md:w-[calc(min(calc(50%-1rem),((100vh-146px)*(2/3))))]
              2xl:w-[calc(min(calc(33.3%-1rem),((100vh-140px)*(4/3))))] 
             `;
    case 4:
      return `w-[calc(min(100%,((100vh-164px)*(1/3))))]
              md:w-[calc(min(calc(50%-0.5rem),((100vh-148px)*(2/3))))]
             `;
    case 5:
      return `w-[calc(min(100%,((100vh-172px)*(4/15))))]
              xs:w-[calc(min(calc(50%-0.5rem),((100vh-156px)*(4/9))))]
              2xl:w-[calc(min(calc(33.3%-1rem),((100vh-148px)*(2/3))))]
             `;
  }
};

const VideoContainer = ({
  nickname,
  isMicOn,
  isVideoOn,
  isLocal,
  isSpeaking,
  reaction,
  stream,
  videoLoading,
  videoCount,
}: VideoContainerProps) => {
  const renderReaction = (reactionType: string) => {
    switch (reactionType) {
      case "thumbs_up":
        return "👍";
      case "":
      default:
        return "";
    }
  };

  const renderMicIcon = () => {
    return isMicOn ? (
      <BsMic className="text-white" />
    ) : (
      <BsMicMute className="text-point-1" />
    );
  };

  const renderVideoIcon = () => {
    return isVideoOn ? (
      <BsCameraVideo className="text-white" />
    ) : (
      <BsCameraVideoOff className="text-point-1" />
    );
  };

  const speakingEffect = isSpeaking
    ? "ring-2 ring-green-100 transition-all duration-200"
    : "transition-all duration-200";

  const localNickName = isLocal ? "text-semibold-r" : "text-medium-m";

  return (
    <div
      className={`relative ${getVideoLayoutClass(videoCount)} ${speakingEffect} rounded-custom-l aspect-[4/3]`}
    >
      <div className="absolute inset-0 bg-gray-black rounded-custom-l overflow-hidden z-10">
        <DisplayMediaStream mediaStream={stream!} isLocal={isLocal} />
        <div className="inline-flex gap-4 absolute bottom-2 w-full justify-between px-2">
          <p
            className={`bg-grayscale-500 ${localNickName} bg-opacity-70 text-white px-2 py-0.5 rounded`}
          >
            {isVideoOn && nickname}
          </p>
          <div className={"inline-flex gap-4 px-2 items-center"}>
            {renderMicIcon()}
            {renderVideoIcon()}
          </div>
        </div>
        {videoLoading && (
          <div
            className={
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse text-3xl"
            }
          >
            <LoadingIndicator loadingState={videoLoading} type={"spinner"} />
          </div>
        )}
      </div>
      <VideoProfileOverlay
        isVideoOn={isVideoOn}
        videoLoading={videoLoading || false}
        nickname={nickname}
      />
      <VideoReactionBox reaction={reaction} renderReaction={renderReaction} />
    </div>
  );
};

export default VideoContainer;

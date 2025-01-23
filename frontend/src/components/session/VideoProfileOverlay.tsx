interface VideoProfileOverlayProps {
  isVideoOn: boolean;
  videoLoading: boolean;
  nickname: string;
  profileImage?: string;
}

const VideoProfileOverlay = ({
  isVideoOn,
  videoLoading,
  nickname,
  profileImage,
}: VideoProfileOverlayProps) => {
  if (isVideoOn || videoLoading) {
    return null;
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-300/20 text-white  p-2 rounded-xl text-3xl overflow-hidden flex justify-center items-center z-10">
      {profileImage ? (
        <div className="aspect-1 w-2/3 h-2/3 bg-gray-400 rounded-full overflow-hidden">
          <img
            className={"object-cover h-full opacity-100"}
            src={profileImage}
            alt={nickname + "프로필 이미지"}
          />
        </div>
      ) : (
        <span className={"w-full text-center"}>{nickname}</span>
      )}
    </div>
  );
};
export default VideoProfileOverlay;

import VideoContainer from "@components/session/VideoContainer.tsx";
import { useCallback, useEffect, useState } from "react";
import useToast from "@hooks/useToast.ts";

interface MediaPreviewModalProps {
  modal: UseModalReturn;
  nickname?: string;
  setNickname: (nickname: string) => void;
  isVideoOn: boolean;
  setIsVideoOn: (value: boolean) => void;
  onConfirm: () => void;
  onReject: () => void;
  setReady: (ready: boolean) => void;
  getMediaStream: (type: "video" | "audio") => Promise<MediaStream | undefined>;
}

interface UseModalReturn {
  dialogRef: React.RefObject<HTMLDialogElement>;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const MediaPreviewModal = ({
  modal,
  nickname,
  setNickname,
  onConfirm,
  onReject,
  getMediaStream,
  isVideoOn,
  setIsVideoOn,
  setReady,
}: MediaPreviewModalProps) => {
  const [preview, setPreview] = useState<MediaStream | undefined>();
  const toast = useToast();

  const getMediaPreview = useCallback(async () => {
    const mediaStream = await getMediaStream("video");
    if (!mediaStream) {
      toast.error("비디오 장치를 찾을 수 없습니다.");
    }
    setPreview(mediaStream);
  }, []);

  useEffect(() => {
    getMediaPreview();

    return () => {
      preview?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (modal.dialogRef.current) {
      const dialog = modal.dialogRef.current;
      const handleEscape = (event: globalThis.KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onReject();
          setReady(false);
        }
      };
      dialog.addEventListener("keydown", (event) => handleEscape(event));
    }
  }, [modal.dialogRef.current]);

  const handleReject = () => {
    onReject();
    setReady(false);
    preview?.getTracks().forEach((track) => track.stop());
  }

  const handleConfirm = () => {
    onConfirm();
    setReady(true);
    modal.closeModal();
    preview?.getTracks().forEach((track) => track.stop());
  }

  return (
    modal.isOpen && (
      <dialog
        ref={modal.dialogRef}
        className={
          "flex flex-col items-center rounded-custom-l px-10 py-6 w-[640px] shadow-lg"
        }
      >
        <h3 className={"text-bold-m"}>비디오 미리보기</h3>
        <div className={"w-[400px] p-4"}>
          <VideoContainer
            nickname={nickname || ""}
            isMicOn={true}
            isVideoOn={isVideoOn}
            isLocal={true}
            isSpeaking={false}
            reaction={""}
            stream={isVideoOn ? preview : undefined}
            videoCount={1}
          />
        </div>
        <div className={"text-medium-r mt-4 flex w-full justify-center gap-4"}>
          <label
            className={
              "inline-flex gap-2 items-center rounded-custom-m px-4 py-2 bg-transparent"
            }
            id={"checkbox"}
          >
            <input
              defaultChecked={!isVideoOn || false}
              className={"w-6 h-6"}
              type={"checkbox"}
              title={"dd"}
              onChange={() => setIsVideoOn(!isVideoOn)}
            />
            <span>내 비디오 끄고 참가하기</span>
          </label>
          <input
            className={
              "rounded-custom-m px-4 py-2 bg-gray-50 hover:bg-gray-100"
            }
            type={"text"}
            defaultValue={nickname}
            placeholder={"닉네임 변경"}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div
          className={"text-semibold-r mt-4 flex w-full justify-center gap-4"}
        >
          <button
            onClick={handleReject}
            className={
              "rounded-custom-m px-16 py-4 bg-gray-50 hover:bg-gray-100"
            }
          >
            세션 나가기
          </button>
          <button
            onClick={handleConfirm}
            className={
              "rounded-custom-m px-16 py-4 bg-green-500 text-white hover:bg-green-600"
            }
          >
            세션 참가
          </button>
        </div>
      </dialog>
    )
  );
};

export default MediaPreviewModal;

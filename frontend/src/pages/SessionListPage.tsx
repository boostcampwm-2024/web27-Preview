import { FaCirclePlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import SessionCard from "../components/SessionCard.tsx";

interface Session {
  id: number;
  title: string;
  category: string;
  sessionStatus: "open" | "close";
  host: {
    nickname: string;
  };
  participant: number;
  maxParticipant: number;
}
enum SessionStatus {
  OPEN = "open",
  CLOSE = "close",
}

const SessionListPage = () => {
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    const sessionData: Session[] = [
      {
        id: 1,
        title: "프론트엔드 초보만 들어올 수 있음",
        category: "프론트엔드",
        sessionStatus: "open",
        host: {
          nickname: "J133",
        },
        participant: 1,
        maxParticipant: 4,
      },
      {
        id: 2,
        title: "백엔드 초보만 들어올 수 있음",
        category: "백엔드",
        sessionStatus: "close",
        host: {
          nickname: "J000",
        },
        participant: 1,
        maxParticipant: 2,
      },
    ];

    setTimeout(() => {
      setSessionList(sessionData);
      setListLoading(false);
    }, 100);
  }, []);
  const renderSessionList = (sessionStatus: SessionStatus) => {
    return sessionList.map((session) => {
      return (
        session.sessionStatus === sessionStatus && (
          <SessionCard
            key={session.id}
            sessionStatus={session.sessionStatus}
            category={session.category}
            title={session.title}
            host={session.host.nickname}
            questionListId={1}
            participant={session.participant}
            maxParticipant={session.maxParticipant}
          />
        )
      );
    });
  };

  return (
    <section
      className={"flex flex-col gap-10 max-w-7xl w-screen h-screen p-20"}
    >
      <div>
        <h1 className={"text-bold-l mb-6"}>스터디 세션 목록</h1>
        <div className={"h-10 flex gap-2"}>
          <input
            className={"rounded-lg px-4 border h-full"}
            type="text"
            placeholder="세션을 검색하세요"
          />
          <select className={"rounded-lg px-4 border h-full"}>
            <option>FE</option>
            <option>BE</option>
          </select>
          <button
            className={
              "flex justify-center items-center fill-current text-white bg-primary hover:bg-primary-hover w-10 h-full rounded-lg"
            }
          >
            <FaCirclePlus />
          </button>
          <button>링크입력</button>
        </div>
      </div>
      <div>
        <h2 className={"text-semibold-xl mb-6"}>공개된 세션 목록</h2>
        <ul>
          {listLoading ? (
            <>loading</>
          ) : (
            <>
              {sessionList.length <= 0 ? (
                <li>아직 아무도 세션을 열지 않았어요..!</li>
              ) : (
                renderSessionList(SessionStatus.OPEN)
              )}
            </>
          )}
        </ul>
      </div>
      <div>
        <h2 className={"text-semibold-xl mb-6"}>진행 중인 세션 목록</h2>
        <ul>
          {listLoading ? (
            <>loading</>
          ) : (
            <>
              {sessionList.length <= 0 ? (
                <li>아직 아무도 세션을 열지 않았어요..!</li>
              ) : (
                renderSessionList(SessionStatus.CLOSE)
              )}
            </>
          )}
        </ul>
      </div>
    </section>
  );
};

export default SessionListPage;

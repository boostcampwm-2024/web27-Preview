import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import SearchBar from "@components/common/SearchBar.tsx";
import Select from "@components/common/Select.tsx";
import SessionList from "@components/sessions/list/SessionList.tsx";
import CreateButton from "@components/common/CreateButton.tsx";
import { options } from "@/constants/CategoryData.ts";
import { useGetSessionList } from "@/pages/SessionListPage/api/useGetSessionList.ts";
import ErrorBlock from "@components/common/Error/ErrorBlock.tsx";
import SidebarPageLayout from "@components/layout/SidebarPageLayout.tsx";

const SessionListPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

  console.log(selectedCategory);

  const { data: sessions, error, isLoading: listLoading } = useGetSessionList();

  const [sessionList, inProgressList] = [
    sessions ? sessions.filter((session) => !session.inProgress) : [],
    sessions ? sessions.filter((session) => session.inProgress) : [],
  ];

  return (
    <SidebarPageLayout>
      <div className={"flex flex-col gap-8 max-w-5xl w-full px-12 pt-20"}>
        <div>
          <h1 className={"text-bold-l mb-6"}>스터디 세션 목록</h1>
          <div className={"h-11 flex gap-2 w-full"}>
            <SearchBar text="세션을 검색하세요" />
            <Select
              value={"FE"}
              setValue={setSelectedCategory}
              options={options}
            />
            <CreateButton
              onClick={() => navigate("/sessions/create")}
              text={"새로운 세션"}
              icon={IoMdAdd}
            />
          </div>
        </div>
        <SessionList
          listTitle={"열려있는 공개 세션 목록"}
          listLoading={listLoading}
          sessionList={sessionList}
        />
        <SessionList
          listTitle={"진행 중인 세션 목록"}
          listLoading={listLoading}
          sessionList={inProgressList}
        />
        {error && (
          <ErrorBlock
            message={"서버에서 세션 목록을 불러오는데 실패했습니다!"}
          />
        )}
      </div>
    </SidebarPageLayout>
  );
};

export default SessionListPage;
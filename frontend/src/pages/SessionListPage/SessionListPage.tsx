import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import SearchBar from "@components/common/Input/SearchBar";
import CategorySelect from "@components/common/Select/CategorySelect";
import { options } from "@/constants/CategoryData.ts";
import SidebarPageLayout from "@components/layout/SidebarPageLayout.tsx";
import TabContainer from "./view/TabContainer";
import { Link } from "react-router-dom";
import { useGetSessionList } from "./api/useGetSessionList";
import SessionList from "./view/SessionList";
import ErrorBlock from "@components/common/Error/ErrorBlock";

const SessionListPage = () => {
  const [currentTab, setCurrentTab] = useState(false);
  const [_, setSelectedCategory] = useState<string>("전체");
  const {
    data: sessionList,
    isLoading,
    error,
  } = useGetSessionList({ inProgress: currentTab });

  return (
    <SidebarPageLayout>
      <div className={"flex flex-col gap-8 max-w-6xl w-full px-12 pt-20 pb-4"}>
        <div className="mb-4">
          <h1 className={"text-bold-l mb-6"}>스터디 채널</h1>
          <div className={"h-11 flex gap-2 w-full"}>
            <CategorySelect
              value={"FE"}
              setValue={setSelectedCategory}
              options={options}
            />
            <SearchBar text="세션을 검색하세요" />
          </div>
        </div>
        <div className="relative flex justify-between">
          <TabContainer currentTab={currentTab} setCurrentTab={setCurrentTab} />
          <Link
            to="/sessions/create"
            className="flex items-center gap-1 text-semibold-m text-gray-black pr-1 pb-2 hover:text-green-400"
          >
            <IoMdAdd />
            <span>세션 생성하기</span>
          </Link>
          <div className="absolute bottom-0 -z-10 w-full h-0.1 bg-gray-100" />
        </div>
        <SessionList inProgress={currentTab} sessionList={sessionList || []} listLoading={isLoading} />
        <ErrorBlock
          error={error}
          message={"서버에서 세션 목록을 불러오는데 실패했습니다"}
        />
      </div>
    </SidebarPageLayout>
  );
};

export default SessionListPage;

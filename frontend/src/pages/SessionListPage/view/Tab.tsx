interface TabProps {
  currentTab: boolean;
  tabStatus: boolean;
  setCurrentTab: React.Dispatch<React.SetStateAction<boolean>>;
}

const Tab = ({ currentTab, tabStatus, setCurrentTab }: TabProps) => {
  return (
    <button
      className={`flex flex-row gap-1
      ${currentTab === tabStatus
          ? "text-bold-s text-green-400"
          : "text-medium-l text-gray-400"
        }`}
      onClick={() => setCurrentTab(tabStatus)}
    >
      <span
        className={`px-1 pb-1.5 border-b-2
        ${currentTab === tabStatus ? "border-green-400" : "border-transparent"}`}
      >
        {tabStatus ? "진행 중인 세션" : "공개된 세션"}
      </span>
      <div
        className={`border-b-2 ${currentTab === tabStatus ? "border-green-400" : "border-transparent"} transition-all duration-200`}
      />
    </button>
  );
};

export default Tab;

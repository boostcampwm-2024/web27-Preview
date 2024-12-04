import useAuth from "@hooks/useAuth.ts";

interface TabsProps {
  tab: "ALL" | "SCRAP";
  setTab: (value: "ALL" | "SCRAP") => void;
}
type Tab = "ALL" | "SCRAP";

const Tabs = ({ tab, setTab }: TabsProps) => {
  const { isLoggedIn } = useAuth();

  const tabs = [
    { name: "모든 질문지", value: "ALL" },
    isLoggedIn ? { name: "스크랩한 질문지", value: "SCRAP" } : null,
  ];
  const selectedTab = tabs.findIndex((t) => t && t.value === tab);
  const selectedClassName = "text-green-600 text-semibold-r";

  return (
    <div className={"relative border-b mt-4 pt-4 py-2 flex gap-4  "}>
      {tabs.map(
        (tab, index) =>
          tab && (
            <button
              key={tab.value}
              onClick={() => setTab(tab.value as Tab)}
              className={`w-28 h-full ${
                selectedTab === index ? selectedClassName : ""
              }`}
            >
              {tab.name}
            </button>
          )
      )}
      <div
        className={`absolute -z-0 pointer-events-none top-0 ${tab === "SCRAP" ? "left-32" : "left-0"} transition-all duration-200 pt-4 py-2 p-1 border-b border-green-200 h-full w-28`}
      ></div>
    </div>
  );
};

export default Tabs;

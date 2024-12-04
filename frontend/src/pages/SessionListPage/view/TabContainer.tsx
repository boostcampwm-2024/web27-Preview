import Tab from "./Tab";

interface CategoryTabProps {
  currentTab: boolean;
  setCurrentTab: React.Dispatch<React.SetStateAction<boolean>>;
}

const TabContainer = ({ currentTab, setCurrentTab }: CategoryTabProps) => {
  return (
    <section className="flex items-center gap-2">
      <Tab
        currentTab={currentTab}
        tabStatus={false}
        setCurrentTab={setCurrentTab}
      />
      <Tab
        currentTab={currentTab}
        tabStatus={true}
        setCurrentTab={setCurrentTab}
      />
    </section>
  );
};

export default TabContainer;

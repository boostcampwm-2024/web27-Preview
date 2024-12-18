import { sectionWithSidebar } from "@/constants/LayoutConstant.ts";
import Sidebar from "@/components/common/Sidebar/Sidebar";

interface SidebarPageLayoutProps {
  children: React.ReactNode;
  childrenClassName?: string;
}

const SidebarPageLayout = ({
  children,
  childrenClassName = "",
}: SidebarPageLayoutProps) => {
  return (
    <section className={sectionWithSidebar}>
      <Sidebar />
      <div className={childrenClassName + " overflow-y-scroll w-full"}>
        {children}
      </div>
    </section>
  );
};

export default SidebarPageLayout;

import { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="ml-[76px] min-h-screen p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

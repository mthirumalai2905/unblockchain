import { Loader2 } from "lucide-react";
import { WorkspaceProvider } from "@/store/WorkspaceStore";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/pages/Auth";
import DashboardContent from "@/components/DashboardContent";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <WorkspaceProvider>
      <DashboardContent />
    </WorkspaceProvider>
  );
};

export default Dashboard;

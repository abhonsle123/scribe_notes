import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Settings, 
  HelpCircle, 
  Menu,
  X,
  Shield,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "New Summary", href: "/dashboard/new-summary", icon: FileText },
    { name: "Past Summaries", href: "/dashboard/summaries", icon: History },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Support", href: "/dashboard/support", icon: HelpCircle },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Liaise</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Security Info */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen && (
            <>
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Secure Platform</span>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">Healthcare Professional</p>
              </div>
            </>
          )}
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className={`${sidebarOpen ? 'w-full' : 'w-auto'} flex items-center space-x-2`}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span>Sign Out</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

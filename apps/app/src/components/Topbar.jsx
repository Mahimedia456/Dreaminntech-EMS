import { useEffect, useState } from "react";
import { Bell, Menu, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "../utils/auth";
import UserDropdown from "./UserDropdown";
import { fetchUnreadNotifications } from "../services/notificationsApi";

export default function Topbar() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const canAccessSettings = user?.role === "admin";

  const [count, setCount] = useState(0);

  async function loadUnread() {
    try {
      const data = await fetchUnreadNotifications();
      setCount(data.count || 0);
    } catch {
      setCount(0);
    }
  }

  useEffect(() => {
    loadUnread();

    const timer = setInterval(loadUnread, 30000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="admin-topbar">
      <button className="topbar-icon-btn" type="button">
        <Menu size={22} />
      </button>

      <div className="topbar-search">
        <Search size={17} />
        <input placeholder="Search employee, task, report..." />
      </div>

      <div className="topbar-actions">
        {canAccessSettings && (
          <button
            className="topbar-icon-btn"
            type="button"
            title="Settings"
            onClick={() => navigate("/settings/company")}
          >
            <Settings size={18} />
          </button>
        )}

        <button
          className="topbar-bell"
          type="button"
          onClick={() => navigate("/notifications")}
        >
          <Bell size={19} />
          {count > 0 && <span>{count}</span>}
        </button>

        <UserDropdown />
      </div>
    </header>
  );
}
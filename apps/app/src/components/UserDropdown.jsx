import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User, UserPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAuthUser, logout } from "../utils/auth";

export default function UserDropdown() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="user-dropdown-wrap" ref={ref}>
      <button
        type="button"
        className="topbar-user topbar-user-btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="topbar-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div>
          <h4>{user?.name || "User"}</h4>
          <p>{user?.role || "employee"}</p>
        </div>

        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="user-dropdown-menu">
    <button type="button" onClick={() => navigate("/profile")}>
  <User size={16} />
  My Profile
</button>

<button type="button" onClick={() => navigate("/profile/edit")}>
  <UserPen size={16} />
  Edit Profile
</button>   

          <button type="button" className="danger" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
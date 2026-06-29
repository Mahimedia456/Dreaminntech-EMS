import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function SidebarSection({
  section,
  open,
  onToggle,
}) {
  return (
    <div className="sidebar-section">
      <button
        type="button"
        className="sidebar-section-toggle"
        onClick={onToggle}
      >
        <span>{section.title}</span>
        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      </button>

      {open && (
        <div className="sidebar-section-items">
          {section.items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
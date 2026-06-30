import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp";
import { roleMenus } from "../data/roleMenus";
import { getAuthUser } from "../utils/auth";
import SidebarSection from "./SidebarSection";

const financeAllowedEmails = [
  "umairawan@mahimediasolutions.com",
  "shahid@mahimediasolutions.com",
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const rawSections = roleMenus[user?.role] || roleMenus.employee;

  // Hide Finance module unless allowed email
  const sections = useMemo(() => {
    const allowed = financeAllowedEmails.includes(
      String(user?.email || "").toLowerCase()
    );

    return rawSections
      .map((section) => {
        if (section.title !== "FINANCE") {
          return section;
        }

        return allowed
          ? section
          : {
              ...section,
              items: [],
            };
      })
      .filter((section) => section.items.length > 0);
  }, [rawSections, user]);

  const initialOpen = useMemo(() => {
    const obj = {};

    sections.forEach((section, index) => {
      obj[section.title] = index < 2;
    });

    return obj;
  }, [sections]);

  const [openSections, setOpenSections] = useState(initialOpen);

  function toggleSection(title) {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-content">
        <div
          className="sidebar-logo"
          onClick={() => navigate("/dashboard")}
        >
          <img src={logo} alt="Dream InnTech" />
        </div>

        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <h4>{user?.name || "User"}</h4>
            <p>{user?.role || "employee"}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              open={Boolean(openSections[section.title])}
              onToggle={() => toggleSection(section.title)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

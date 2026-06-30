import React from "react";
import {
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckSquare,
  Clock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListPlus,
  Receipt,
  Settings,
  ShieldCheck,
  Timer,
  Users,
  Wallet,
  CreditCard,
} from "lucide-react";

export const roleMenus = {
  admin: [
    {
      title: "OVERVIEW",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },

    {
      title: "ATTENDANCE",
      items: [
        { to: "/attendance", label: "Clock In Portal", icon: Clock },
        { to: "/attendance-history", label: "Attendance History", icon: FileText },
        { to: "/attendance-analytics", label: "Attendance Analytics", icon: BarChart3 },
        { to: "/leaves", label: "Leave Requests", icon: CalendarDays },
        { to: "/holidays", label: "Holidays", icon: CalendarDays },
      ],
    },

    {
      title: "HR MANAGEMENT",
      items: [
        { to: "/employees", label: "Employees", icon: Users },
        { to: "/employees/create", label: "Add Employee", icon: ListPlus },
        { to: "/departments", label: "Departments", icon: Building2 },
        { to: "/designations", label: "Designations", icon: BadgeCheck },
        { to: "/shifts", label: "Shifts", icon: Timer },
      ],
    },

    {
      title: "PAYROLL",
      items: [
        { to: "/payroll", label: "Payroll", icon: Wallet },
        { to: "/salary-slips", label: "Salary Slips", icon: Receipt },
      ],
    },

    {
      title: "PROJECTS & TASKS",
      items: [
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/tasks", label: "Tasks", icon: CheckSquare },
        { to: "/tasks/create", label: "Task Builder", icon: ListPlus },
      ],
    },
{
  title: "FINANCE",
  items: [
    { to: "/finance-expenses", label: "Finance Expenses", icon: CreditCard },
  ],
},
    {
      title: "SYSTEM",
      items: [
        { to: "/notifications", label: "Notifications", icon: Bell },
        { to: "/reports-center", label: "Reports Center", icon: FileText },
        { to: "/settings/company", label: "Company Settings", icon: Settings },
        { to: "/settings/roles", label: "Roles & Permissions", icon: ShieldCheck },
      ],
    },
  ],

  manager: [
    {
      title: "OVERVIEW",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },

    {
      title: "TEAM ATTENDANCE",
      items: [
        { to: "/attendance", label: "Team Attendance", icon: Clock },
        { to: "/attendance-history", label: "Attendance History", icon: FileText },
        { to: "/attendance-analytics", label: "Team Analytics", icon: BarChart3 },
        { to: "/leaves", label: "Leave Approvals", icon: CalendarDays },
      ],
    },

    {
      title: "TEAM MANAGEMENT",
      items: [
        { to: "/employees", label: "Team Members", icon: Users },
        { to: "/departments", label: "Departments", icon: Building2 },
        { to: "/designations", label: "Designations", icon: BadgeCheck },
      ],
    },

    {
      title: "PROJECTS",
      items: [
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/tasks", label: "Tasks", icon: CheckSquare },
        { to: "/tasks/create", label: "Create Task", icon: ListPlus },
      ],
    },
{
  title: "FINANCE",
  items: [
    { to: "/finance-expenses", label: "Finance Expenses", icon: CreditCard },
  ],
},
    {
      title: "SYSTEM",
      items: [
        { to: "/notifications", label: "Notifications", icon: Bell },
        { to: "/reports-center", label: "Reports", icon: FileText },
        { to: "/settings/company", label: "Company Settings", icon: Settings },
      ],
    },
  ],

  employee: [
    {
      title: "MY WORKSPACE",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/attendance", label: "My Attendance", icon: Clock },
        { to: "/attendance-history", label: "Attendance History", icon: FileText },
        { to: "/leaves", label: "My Leaves", icon: CalendarDays },
        { to: "/holidays", label: "Holidays", icon: CalendarDays },
      ],
    },

    {
      title: "MY TASKS",
      items: [
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/tasks", label: "Tasks", icon: CheckSquare },
      ],
    },

    {
      title: "MY ACCOUNT",
      items: [
        { to: "/employees", label: "My Profile", icon: Users },
        { to: "/salary-slips", label: "Salary Slips", icon: Receipt },
        { to: "/notifications", label: "Notifications", icon: Bell },
      ],
    },
  ],
};
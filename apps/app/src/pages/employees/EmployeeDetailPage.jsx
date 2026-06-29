import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FolderKanban,
} from "lucide-react";
import { getAuthUser } from "../../utils/auth";
import { fetchEmployeeDetail } from "../../services/employeesApi";

const tabs = [
  "Overview",
  "Attendance",
  "Leaves",
  "Salary",
  "Documents",
  "Projects",
  "Activity Logs",
];

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const user = getAuthUser();
  const [activeTab, setActiveTab] = useState("Overview");
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const canSeeSalary =
    user.role === "admin" || user.email === employee?.email;

  async function loadEmployee() {
    try {
      setLoading(true);
      const data = await fetchEmployeeDetail(id);
      setEmployee(data.employee);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployee();
  }, [id]);

  if (loading) {
    return <div className="dashboard-card">Loading employee...</div>;
  }

  if (!employee) {
    return <div className="dashboard-card">Employee not found.</div>;
  }

  const initials = `${employee.first_name?.[0] || ""}${employee.last_name?.[0] || ""}` || "U";

  return (
    <div>
      <div className="employee-detail-header">
        <div className="employee-detail-avatar">{initials.toUpperCase()}</div>

        <div>
          <h1>{employee.full_name}</h1>
          <p>
            {employee.designation || "Employee"} • {employee.department || "No Department"}
          </p>

          <div className="employee-detail-badges">
            <span>{employee.employee_code}</span>
            <span>{employee.status}</span>
            <span>{employee.role}</span>
          </div>
        </div>
      </div>

      <div className="employee-detail-tabs">
        {tabs
          .filter((tab) => tab !== "Salary" || canSeeSalary)
          .map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
      </div>

      {activeTab === "Overview" && <OverviewTab employee={employee} />}
      {activeTab === "Attendance" && <AttendanceTab />}
      {activeTab === "Leaves" && <LeavesTab employee={employee} />}
      {activeTab === "Salary" && canSeeSalary && <SalaryTab employee={employee} />}
      {activeTab === "Documents" && <DocumentsTab documents={documents} />}
      {activeTab === "Projects" && <ProjectsTab />}
      {activeTab === "Activity Logs" && <ActivityTab />}
    </div>
  );
}

function OverviewTab({ employee }) {
  return (
    <div>
      <div className="stats-grid">
        <DetailStat title="Joining Date" value={employee.joining_date || "-"} icon={CalendarDays} />
        <DetailStat title="Department" value={employee.department || "-"} icon={BriefcaseBusiness} />
        <DetailStat title="Shift" value={employee.shift || "-"} icon={Clock3} />
        <DetailStat title="Active Projects" value="03" icon={FolderKanban} />
      </div>

      <div className="employee-detail-grid">
        <div className="dashboard-card">
          <h2>Personal Information</h2>

          <div className="profile-info">
            <InfoRow label="Full Name" value={employee.full_name} />
            <InfoRow label="Email" value={employee.email} />
            <InfoRow label="Phone" value={employee.phone || "-"} />
            <InfoRow label="CNIC" value={employee.cnic || "-"} />
            <InfoRow label="Gender" value={employee.gender || "-"} />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Employment Information</h2>

          <div className="profile-info">
            <InfoRow label="Role" value={employee.role} />
            <InfoRow label="Designation" value={employee.designation || "-"} />
            <InfoRow label="Shift" value={employee.shift || "-"} />
            <InfoRow label="Office Time" value={`${employee.start_time || "-"} - ${employee.end_time || "-"}`} />
            <InfoRow label="Grace Time" value={`${employee.grace_minutes || 0} Minutes`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceTab() {
  return (
    <div className="dashboard-card">
      <h2>Attendance Summary</h2>
      <div className="dashboard-list">
        <div><strong>Attendance data</strong><span>Will connect in attendance module</span></div>
      </div>
    </div>
  );
}

function LeavesTab({ employee }) {
  return (
    <div>
      <div className="stats-grid">
        <DetailStat title="Annual Leaves" value={employee.annual_leaves || 0} icon={CalendarDays} />
        <DetailStat title="Casual Leaves" value={employee.casual_leaves || 0} icon={CalendarDays} />
        <DetailStat title="Sick Leaves" value={employee.sick_leaves || 0} icon={CalendarDays} />
        <DetailStat title="Extra Leaves" value="0" icon={CalendarDays} />
      </div>
    </div>
  );
}

function SalaryTab({ employee }) {
  const allowances =
    Number(employee.medical_allowance || 0) +
    Number(employee.fuel_allowance || 0) +
    Number(employee.food_allowance || 0);

  return (
    <div className="dashboard-card">
      <h2>Salary Information</h2>

      <div className="profile-info">
        <InfoRow label="Basic Salary" value={`Rs ${Number(employee.basic_salary || 0).toLocaleString()}`} />
        <InfoRow label="Allowances" value={`Rs ${allowances.toLocaleString()}`} />
        <InfoRow label="Overtime Rate" value={`Rs ${Number(employee.overtime_rate || 0).toLocaleString()}`} />
        <InfoRow label="Bank Name" value={employee.bank_name || "-"} />
        <InfoRow label="IBAN" value={employee.iban || "-"} />
      </div>
    </div>
  );
}

function DocumentsTab({ documents }) {
  return (
    <div className="dashboard-card">
      <h2>Documents</h2>

      {documents.length === 0 ? (
        <div className="dashboard-list">
          <div><strong>No documents uploaded</strong><span>Pending</span></div>
        </div>
      ) : (
        <div className="dashboard-list">
          {documents.map((doc) => (
            <div key={doc.id}>
              <strong>{doc.document_type}</strong>
              <span>{doc.file_name || "Uploaded"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsTab() {
  return (
    <div className="dashboard-card">
      <h2>Assigned Projects</h2>
      <div className="dashboard-list">
        <div><strong>Projects data</strong><span>Will connect in project module</span></div>
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="dashboard-card">
      <h2>Activity Logs</h2>
      <div className="dashboard-list">
        <div><strong>Activity data</strong><span>Will connect later</span></div>
      </div>
    </div>
  );
}

function DetailStat({ title, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>

      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchDepartments,
  fetchDesignations,
  fetchEmployeeDetail,
  fetchShifts,
  updateEmployee,
} from "../../services/employeesApi";

const initialForm = {
  employee_code: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  cnic: "",
  gender: "Male",
  date_of_birth: "",
  username: "",
  role: "employee",

  department_id: "",
  designation_id: "",
  shift_id: "",

  joining_date: "",
  employment_type: "full_time",
  status: "active",

  annual_leaves: 18,
  casual_leaves: 10,
  sick_leaves: 10,

  basic_salary: "",
  medical_allowance: "",
  fuel_allowance: "",
  food_allowance: "",
  overtime_rate: "",

  bank_name: "",
  account_number: "",
  iban: "",
  address: "",
};

export default function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toDateInput(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
  }

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [detailRes, departmentsRes, designationsRes, shiftsRes] =
        await Promise.all([
          fetchEmployeeDetail(id),
          fetchDepartments(),
          fetchDesignations(),
          fetchShifts(),
        ]);

      const employee = detailRes.employee;

      setDepartments(departmentsRes.departments || []);
      setDesignations(designationsRes.designations || []);
      setShifts(shiftsRes.shifts || []);

      setForm({
        employee_code: employee.employee_code || "",
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        cnic: employee.cnic || "",
        gender: employee.gender || "Male",
        date_of_birth: toDateInput(employee.date_of_birth),
        username: employee.username || "",
        role: employee.role || "employee",

        department_id: employee.department_id || "",
        designation_id: employee.designation_id || "",
        shift_id: employee.shift_id || "",

        joining_date: toDateInput(employee.joining_date),
        employment_type: employee.employment_type || "full_time",
        status: employee.status || "active",

        annual_leaves: employee.annual_leaves || 18,
        casual_leaves: employee.casual_leaves || 10,
        sick_leaves: employee.sick_leaves || 10,

        basic_salary: employee.basic_salary || "",
        medical_allowance: employee.medical_allowance || "",
        fuel_allowance: employee.fuel_allowance || "",
        food_allowance: employee.food_allowance || "",
        overtime_rate: employee.overtime_rate || "",

        bank_name: employee.bank_name || "",
        account_number: employee.account_number || "",
        iban: employee.iban || "",
        address: employee.address || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateEmployee(id, form);
      navigate(`/employees/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return <div className="dashboard-card">Loading employee...</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Edit Employee</h1>
          <p>Update employee profile, role, salary and HR settings.</p>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="employee-form-layout" onSubmit={handleSubmit}>
        <div className="dashboard-card">
          <h2>Basic Information</h2>

          <div className="employee-form-grid">
            <FormInput label="Employee ID" value={form.employee_code} onChange={(v) => updateField("employee_code", v)} />
            <FormInput label="First Name" value={form.first_name} onChange={(v) => updateField("first_name", v)} required />
            <FormInput label="Last Name" value={form.last_name} onChange={(v) => updateField("last_name", v)} />
            <FormInput label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} required />
            <FormInput label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
            <FormInput label="CNIC" value={form.cnic} onChange={(v) => updateField("cnic", v)} />

            <FormSelect label="Gender" value={form.gender} onChange={(v) => updateField("gender", v)}>
              <option>Male</option>
              <option>Female</option>
            </FormSelect>

            <FormInput label="Date of Birth" type="date" value={form.date_of_birth} onChange={(v) => updateField("date_of_birth", v)} />

            <FormSelect label="Status" value={form.status} onChange={(v) => updateField("status", v)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </FormSelect>

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Address</label>
              <textarea
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                style={{ minHeight: 90, paddingTop: 12 }}
              />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Employment Information</h2>

          <div className="employee-form-grid">
            <FormSelect label="Department" value={form.department_id} onChange={(v) => updateField("department_id", v)}>
              <option value="">Select Department</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </FormSelect>

            <FormSelect label="Designation" value={form.designation_id} onChange={(v) => updateField("designation_id", v)}>
              <option value="">Select Designation</option>
              {designations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.department ? `(${item.department})` : ""}
                </option>
              ))}
            </FormSelect>

            <FormSelect label="Role" value={form.role} onChange={(v) => updateField("role", v)}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </FormSelect>

            <FormInput label="Joining Date" type="date" value={form.joining_date} onChange={(v) => updateField("joining_date", v)} />

            <FormSelect label="Employment Type" value={form.employment_type} onChange={(v) => updateField("employment_type", v)}>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </FormSelect>

            <FormSelect label="Shift" value={form.shift_id} onChange={(v) => updateField("shift_id", v)}>
              <option value="">Select Shift</option>
              {shifts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </FormSelect>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Leave Allocation</h2>

          <div className="employee-form-grid">
            <FormInput label="Annual Leaves" type="number" value={form.annual_leaves} onChange={(v) => updateField("annual_leaves", v)} />
            <FormInput label="Casual Leaves" type="number" value={form.casual_leaves} onChange={(v) => updateField("casual_leaves", v)} />
            <FormInput label="Sick Leaves" type="number" value={form.sick_leaves} onChange={(v) => updateField("sick_leaves", v)} />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Salary Information</h2>

          <div className="employee-form-grid">
            <FormInput label="Basic Salary" type="number" value={form.basic_salary} onChange={(v) => updateField("basic_salary", v)} />
            <FormInput label="Medical Allowance" type="number" value={form.medical_allowance} onChange={(v) => updateField("medical_allowance", v)} />
            <FormInput label="Fuel Allowance" type="number" value={form.fuel_allowance} onChange={(v) => updateField("fuel_allowance", v)} />
            <FormInput label="Food Allowance" type="number" value={form.food_allowance} onChange={(v) => updateField("food_allowance", v)} />
            <FormInput label="Overtime Rate" type="number" value={form.overtime_rate} onChange={(v) => updateField("overtime_rate", v)} />
            <FormInput label="Bank Name" value={form.bank_name} onChange={(v) => updateField("bank_name", v)} />
            <FormInput label="Account Number" value={form.account_number} onChange={(v) => updateField("account_number", v)} />
            <FormInput label="IBAN" value={form.iban} onChange={(v) => updateField("iban", v)} />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>System Access</h2>

          <div className="employee-form-grid">
            <FormInput label="Username" value={form.username} onChange={(v) => updateField("username", v)} />
          </div>
        </div>

        <div className="employee-submit-wrap">
          <button type="submit" className="login-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value || ""}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, children }) {
  return (
    <div>
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}
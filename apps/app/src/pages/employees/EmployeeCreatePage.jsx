import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createEmployee,
  fetchDepartments,
  fetchDesignations,
  fetchShifts,
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
  password: "Mahimediasolutions@786",
  role: "employee",

  department_id: "",
  designation_id: "",
  shift_id: "",

  joining_date: "",
  employment_type: "full_time",

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
};

export default function EmployeeCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [error, setError] = useState("");

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function loadMeta() {
    try {
      setMetaLoading(true);

      const [departmentsRes, designationsRes, shiftsRes] = await Promise.all([
        fetchDepartments(),
        fetchDesignations(),
        fetchShifts(),
      ]);

      setDepartments(departmentsRes.departments || []);
      setDesignations(designationsRes.designations || []);
      setShifts(shiftsRes.shifts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setMetaLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createEmployee({
        ...form,
        username: form.username || form.email.split("@")[0],
        employee_code: form.employee_code || `EMP-${Date.now()}`,
      });

      navigate("/employees");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeta();
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Create Employee</h1>
          <p>Add a new employee into the organization.</p>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="employee-form-layout" onSubmit={handleSubmit}>
        <div className="dashboard-card">
          <h2>Basic Information</h2>

          <div className="employee-form-grid">
            <FormInput label="Employee ID" value={form.employee_code} onChange={(v) => updateField("employee_code", v)} placeholder="EMP-001" />
            <FormInput label="First Name" value={form.first_name} onChange={(v) => updateField("first_name", v)} placeholder="First Name" required />
            <FormInput label="Last Name" value={form.last_name} onChange={(v) => updateField("last_name", v)} placeholder="Last Name" />
            <FormInput label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} placeholder="Email Address" required />
            <FormInput label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} placeholder="+92 300 0000000" />
            <FormInput label="CNIC" value={form.cnic} onChange={(v) => updateField("cnic", v)} placeholder="42101-1234567-1" />

            <FormSelect label="Gender" value={form.gender} onChange={(v) => updateField("gender", v)}>
              <option>Male</option>
              <option>Female</option>
            </FormSelect>

            <FormInput label="Date of Birth" type="date" value={form.date_of_birth} onChange={(v) => updateField("date_of_birth", v)} />

            <div>
              <label>Profile Photo</label>
              <input type="file" disabled />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Employment Information</h2>

          <div className="employee-form-grid">
            <FormSelect label="Department" value={form.department_id} onChange={(v) => updateField("department_id", v)} disabled={metaLoading}>
              <option value="">Select Department</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </FormSelect>

            <FormSelect label="Designation" value={form.designation_id} onChange={(v) => updateField("designation_id", v)} disabled={metaLoading}>
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
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Attendance & Shift</h2>

          <div className="employee-form-grid">
            <FormSelect label="Shift" value={form.shift_id} onChange={(v) => updateField("shift_id", v)} disabled={metaLoading}>
              <option value="">Select Shift</option>
              {shifts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </FormSelect>

            <FormInput label="Annual Leaves" type="number" value={form.annual_leaves} onChange={(v) => updateField("annual_leaves", v)} />
            <FormInput label="Casual Leaves" type="number" value={form.casual_leaves} onChange={(v) => updateField("casual_leaves", v)} />
            <FormInput label="Sick Leaves" type="number" value={form.sick_leaves} onChange={(v) => updateField("sick_leaves", v)} />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Salary Information</h2>

          <div className="employee-form-grid">
            <FormInput label="Basic Salary" type="number" value={form.basic_salary} onChange={(v) => updateField("basic_salary", v)} placeholder="50000" />
            <FormInput label="Medical Allowance" type="number" value={form.medical_allowance} onChange={(v) => updateField("medical_allowance", v)} placeholder="5000" />
            <FormInput label="Fuel Allowance" type="number" value={form.fuel_allowance} onChange={(v) => updateField("fuel_allowance", v)} placeholder="3000" />
            <FormInput label="Food Allowance" type="number" value={form.food_allowance} onChange={(v) => updateField("food_allowance", v)} placeholder="2000" />
            <FormInput label="Overtime Rate" type="number" value={form.overtime_rate} onChange={(v) => updateField("overtime_rate", v)} placeholder="500" />
            <FormInput label="Bank Name" value={form.bank_name} onChange={(v) => updateField("bank_name", v)} />
            <FormInput label="Account Number" value={form.account_number} onChange={(v) => updateField("account_number", v)} />
            <FormInput label="IBAN" value={form.iban} onChange={(v) => updateField("iban", v)} />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>System Access</h2>

          <div className="employee-form-grid">
            <FormInput label="Username" value={form.username} onChange={(v) => updateField("username", v)} placeholder="Auto from email if empty" />
            <FormInput label="Password" type="password" value={form.password} onChange={(v) => updateField("password", v)} />
          </div>
        </div>

        <div className="employee-submit-wrap">
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value || ""}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, children, disabled = false }) {
  return (
    <div>
      <label>{label}</label>
      <select value={value || ""} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}
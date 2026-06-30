import React, { useEffect, useState } from "react";
import {
  fetchCompanySettings,
  saveCompanySettings,
} from "../../services/settingsApi";

const initialForm = {
  company_name: "Dream InnTech",
  email: "",
  phone: "",
  address: "",
  timezone: "Asia/Karachi",
  currency: "PKR",
  working_days: "monday_friday",
  office_start: "09:00",
  office_end: "18:00",
  grace_minutes: 15,
  smtp_host: "",
  smtp_port: "",
  smtp_username: "",
  smtp_password: "",
  smtp_secure: true,
};

export default function CompanySettingsPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await fetchCompanySettings();
      if (data.settings) {
        setForm({
          ...initialForm,
          ...data.settings,
          office_start: String(data.settings.office_start || "09:00").slice(0, 5),
          office_end: String(data.settings.office_end || "18:00").slice(0, 5),
        });
      }
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
      setMessage("");

      await saveCompanySettings(form);

      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return <div className="dashboard-card">Loading settings...</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Company Settings</h1>
          <p>Manage company information, office timings, SMTP and system settings.</p>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-success">{message}</div>}

      <form className="employee-form-layout" onSubmit={handleSubmit}>
        <div className="dashboard-card">
          <h2>Company Information</h2>

          <div className="employee-form-grid">
            <Field label="Company Name" value={form.company_name} onChange={(v) => updateField("company_name", v)} />
            <Field label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} />
            <Field label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
            <Field label="Address" value={form.address} onChange={(v) => updateField("address", v)} />

            <div>
              <label>Timezone</label>
              <select value={form.timezone} onChange={(e) => updateField("timezone", e.target.value)}>
                <option value="Asia/Karachi">Asia/Karachi</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label>Currency</label>
              <select value={form.currency} onChange={(e) => updateField("currency", e.target.value)}>
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Office Settings</h2>

          <div className="employee-form-grid">
            <div>
              <label>Working Days</label>
              <select value={form.working_days} onChange={(e) => updateField("working_days", e.target.value)}>
                <option value="monday_friday">Monday - Friday</option>
                <option value="monday_saturday">Monday - Saturday</option>
                <option value="all_days">All Days</option>
              </select>
            </div>

            <Field label="Office Start" type="time" value={form.office_start} onChange={(v) => updateField("office_start", v)} />
            <Field label="Office End" type="time" value={form.office_end} onChange={(v) => updateField("office_end", v)} />
            <Field label="Grace Minutes" type="number" value={form.grace_minutes} onChange={(v) => updateField("grace_minutes", v)} />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>SMTP Settings</h2>

          <div className="employee-form-grid">
            <Field label="SMTP Host" value={form.smtp_host} onChange={(v) => updateField("smtp_host", v)} />
            <Field label="SMTP Port" value={form.smtp_port} onChange={(v) => updateField("smtp_port", v)} />
            <Field label="Username" value={form.smtp_username} onChange={(v) => updateField("smtp_username", v)} />
            <Field label="Password" type="password" value={form.smtp_password} onChange={(v) => updateField("smtp_password", v)} />

            <div>
              <label>SMTP Secure</label>
              <select
                value={String(form.smtp_secure)}
                onChange={(e) => updateField("smtp_secure", e.target.value === "true")}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
        </div>

        <div className="employee-submit-wrap">
          <button className="login-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label>{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

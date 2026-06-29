import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyProfile, updateMyProfile } from "../../services/profileApi";

const initialForm = {
  full_name: "",
  phone: "",
  address: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  bio: "",
};

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await fetchMyProfile();

      if (data.profile) {
        setForm({
          full_name: data.profile.full_name || "",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          emergency_contact_name: data.profile.emergency_contact_name || "",
          emergency_contact_phone: data.profile.emergency_contact_phone || "",
          bio: data.profile.bio || "",
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

      await updateMyProfile(form);

      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) return <div className="dashboard-card">Loading profile...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Edit Profile</h1>
          <p>Update your personal profile information.</p>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="employee-form-layout" onSubmit={handleSubmit}>
        <div className="dashboard-card">
          <h2>Basic Information</h2>

          <div className="employee-form-grid">
            <Field
              label="Full Name"
              value={form.full_name}
              onChange={(v) => updateField("full_name", v)}
            />

            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => updateField("phone", v)}
            />

            <Field
              label="Emergency Contact Name"
              value={form.emergency_contact_name}
              onChange={(v) => updateField("emergency_contact_name", v)}
            />

            <Field
              label="Emergency Contact Phone"
              value={form.emergency_contact_phone}
              onChange={(v) => updateField("emergency_contact_phone", v)}
            />

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Address</label>
              <textarea
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="employee-submit-wrap">
          <button className="login-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
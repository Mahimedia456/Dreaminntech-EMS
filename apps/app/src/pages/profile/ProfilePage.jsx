import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, UserPen } from "lucide-react";
import { fetchMyProfile } from "../../services/profileApi";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      const data = await fetchMyProfile();
      setProfile(data.profile);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (!profile) return <div className="dashboard-card">Loading profile...</div>;

  return (
    <div>
      <div className="employee-detail-header">
        <div className="employee-detail-avatar">
          {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div>
          <h1>{profile.full_name}</h1>
          <p>
            {profile.designation || profile.role} • {profile.department || "-"}
          </p>

          <div className="employee-detail-badges">
            <span>{profile.employee_code || "-"}</span>
            <span>{profile.user_status}</span>
            <span>{profile.role}</span>
          </div>
        </div>

        <Link to="/profile/edit" className="employee-add-btn">
          <UserPen size={18} />
          Edit Profile
        </Link>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="payroll-grid">
        <div className="dashboard-card">
          <h2>Personal Information</h2>

          <div className="profile-info">
            <Info label="Full Name" value={profile.full_name} />
            <Info label="Email" value={profile.email} />
            <Info label="Phone" value={profile.phone || "-"} />
            <Info label="CNIC" value={profile.cnic || "-"} />
            <Info label="Gender" value={profile.gender || "-"} />
            <Info label="Date of Birth" value={profile.date_of_birth || "-"} />
            <Info label="Address" value={profile.address || "-"} />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Employment Information</h2>

          <div className="profile-info">
            <Info label="Department" value={profile.department || "-"} />
            <Info label="Designation" value={profile.designation || "-"} />
            <Info label="Shift" value={profile.shift || "-"} />
            <Info label="Joining Date" value={profile.joining_date || "-"} />
            <Info label="Employment Type" value={profile.employment_type || "-"} />
            <Info label="Employee Status" value={profile.employee_status || "-"} />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Emergency Contact</h2>

          <div className="profile-info">
            <Info
              label="Name"
              value={profile.emergency_contact_name || "-"}
            />
            <Info
              label="Phone"
              value={profile.emergency_contact_phone || "-"}
            />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Bio</h2>
          <p className="text-gray-400">{profile.bio || "No bio added."}</p>

          <div className="dashboard-list" style={{ marginTop: 18 }}>
            <div>
              <strong>
                <Mail size={15} /> Email
              </strong>
              <span>{profile.email}</span>
            </div>

            <div>
              <strong>
                <Phone size={15} /> Phone
              </strong>
              <span>{profile.phone || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

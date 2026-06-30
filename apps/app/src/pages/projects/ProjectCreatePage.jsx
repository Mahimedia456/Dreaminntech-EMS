import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../../components/projects/ProjectForm";
import { createProject } from "../../services/projectsApi";

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError("");
      await createProject(payload);
      navigate("/projects");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Create Project</h1>
        <p>Add a new company project.</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <ProjectForm onSubmit={handleSubmit} loading={saving} />
    </div>
  );
}

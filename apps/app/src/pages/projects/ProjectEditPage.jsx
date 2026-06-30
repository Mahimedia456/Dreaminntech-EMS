import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectForm from "../../components/projects/ProjectForm";
import { fetchProjectDetail, updateProject } from "../../services/projectsApi";

export default function ProjectEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadProject() {
    try {
      const data = await fetchProjectDetail(id);
      setProject(data.project);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      await updateProject(id, payload);
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, [id]);

  if (!project) return <div className="dashboard-card">Loading project...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Edit Project</h1>
        <p>Update project details.</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <ProjectForm initialValues={project} onSubmit={handleSubmit} loading={saving} />
    </div>
  );
}

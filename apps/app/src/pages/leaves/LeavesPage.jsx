import React from "react";
import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle, Clock3, Plus, XCircle } from "lucide-react";


import { getAuthUser } from "../../utils/auth";
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  fetchLeaveBalances,
  fetchLeaveRequests,
  fetchLeaveTypes,
  rejectLeaveRequest,
} from "../../services/leavesApi";

import LeaveRequestModal from "../../components/leaves/LeaveRequestModal";
import LeaveRejectModal from "../../components/leaves/LeaveRejectModal";
import LeaveBalanceCard from "../../components/leaves/LeaveBalanceCard";

export default function LeavesPage() {
  const user = getAuthUser();

  const [requests, setRequests] = useState([]);
  const [types, setTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [error, setError] = useState("");

  async function loadLeaves() {
    try {
      setLoading(true);
      setError("");

      const [requestsRes, typesRes] = await Promise.all([
        fetchLeaveRequests(),
        fetchLeaveTypes(),
      ]);

      setRequests(requestsRes.requests || []);
      setTypes(typesRes.types || []);

      if (user.role === "employee") {
        const balanceRes = await fetchLeaveBalances();
        setBalances(balanceRes.balances || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLeave(payload) {
    try {
      setError("");
      await createLeaveRequest(payload);
      setRequestModalOpen(false);
      loadLeaves();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleApprove(id) {
    try {
      setError("");
      await approveLeaveRequest(id);
      loadLeaves();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReject(payload) {
    try {
      setError("");
      await rejectLeaveRequest(selectedRequest.id, payload);
      setRejectModalOpen(false);
      setSelectedRequest(null);
      loadLeaves();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this leave request?")) return;

    try {
      setError("");
      await cancelLeaveRequest(id);
      loadLeaves();
    } catch (err) {
      setError(err.message);
    }
  }

  function openReject(item) {
    setSelectedRequest(item);
    setRejectModalOpen(true);
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  if (user.role === "employee") {
    return (
      <>
        <EmployeeLeaves
          requests={requests}
          balances={balances}
          loading={loading}
          error={error}
          onOpenRequest={() => setRequestModalOpen(true)}
          onCancel={handleCancel}
        />

        <LeaveRequestModal
          open={requestModalOpen}
          leaveTypes={types}
          onClose={() => setRequestModalOpen(false)}
          onSubmit={handleCreateLeave}
        />
      </>
    );
  }

  return (
    <>
      <AdminManagerLeaves
        role={user.role}
        requests={requests}
        loading={loading}
        error={error}
        onApprove={handleApprove}
        onReject={openReject}
      />

      <LeaveRejectModal
        open={rejectModalOpen}
        selected={selectedRequest}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleReject}
      />
    </>
  );
}

function AdminManagerLeaves({ role, requests, loading, error, onApprove, onReject }) {
  const pending = requests.filter((item) => item.status === "pending").length;
  const approved = requests.filter((item) => item.status === "approved").length;
  const rejected = requests.filter((item) => item.status === "rejected").length;

  return (
    <div>
      <div className="dashboard-header">
        <h1>{role === "admin" ? "Leave Requests" : "Team Leave Approvals"}</h1>
        <p>Review, approve and reject employee leave requests.</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <LeaveStat title="Pending Requests" value={pending} icon={Clock3} />
        <LeaveStat title="Approved" value={approved} icon={CheckCircle} />
        <LeaveStat title="Rejected" value={rejected} icon={XCircle} />
        <LeaveStat title="Total Yearly Holidays" value="18" icon={CalendarDays} />
      </div>

      <div className="dashboard-card">
        <h2>Leave Requests</h2>

        {loading ? (
          <p className="text-gray-400">Loading leave requests...</p>
        ) : (
          <div className="leave-table">
            <div className="leave-table-head">
              <span>Employee</span>
              <span>Type</span>
              <span>Dates</span>
              <span>Days</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {requests.map((row) => (
              <div className="leave-table-row" key={row.id}>
                <span>{row.employee_name}</span>
                <span>{row.leave_type}</span>
                <span>
                  {row.start_date} - {row.end_date}
                </span>
                <span>{row.total_days}</span>
                <span>{row.status}</span>

                <div className="leave-actions">
                  {row.status === "pending" ? (
                    <>
                      <button onClick={() => onApprove(row.id)}>Approve</button>
                      <button className="danger" onClick={() => onReject(row)}>
                        Reject
                      </button>
                    </>
                  ) : (
                    <span>{row.approved_by_name || "-"}</span>
                  )}
                </div>
              </div>
            ))}

            {!requests.length && (
              <div className="leave-table-row">
                <span>No leave requests found</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeLeaves({
  requests,
  balances,
  loading,
  error,
  onOpenRequest,
  onCancel,
}) {
  const pending = requests.filter((item) => item.status === "pending").length;

  const annual = balances.find((item) => item.code === "ANNUAL");
  const casual = balances.find((item) => item.code === "CASUAL");
  const sick = balances.find((item) => item.code === "SICK");

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>My Leaves</h1>
          <p>Request leaves and track your yearly balance.</p>
        </div>

        <button className="employee-add-btn" onClick={onOpenRequest}>
          <Plus size={18} />
          Request Leave
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <LeaveStat title="Annual Leaves Left" value={annual?.remaining_days || 0} icon={CalendarDays} />
        <LeaveStat title="Casual Leaves Left" value={casual?.remaining_days || 0} icon={CalendarDays} />
        <LeaveStat title="Sick Leaves Left" value={sick?.remaining_days || 0} icon={CalendarDays} />
        <LeaveStat title="Pending Requests" value={pending} icon={Clock3} />
      </div>

      <div className="leave-grid">
        <div className="dashboard-card">
          <h2>Leave Balances</h2>

          <div className="leave-balance-grid">
            {balances.map((balance) => (
              <LeaveBalanceCard key={balance.id} balance={balance} />
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>My Recent Requests</h2>

          {loading ? (
            <p className="text-gray-400">Loading requests...</p>
          ) : (
            <div className="dashboard-list">
              {requests.map((item) => (
                <div key={item.id}>
                  <strong>
                    {item.leave_type} ({item.total_days} days)
                  </strong>

                  <span>
                    {item.status}
                    {item.status === "pending" && (
                      <button
                        type="button"
                        className="inline-action-btn"
                        onClick={() => onCancel(item.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </span>
                </div>
              ))}

              {!requests.length && (
                <div>
                  <strong>No requests found</strong>
                  <span>-</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeaveStat({ title, value, icon: Icon }) {
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
import React, { useEffect, useState } from "react";


import {
  CalendarDays,
  Plus,
} from "lucide-react";

import { getAuthUser } from "../../utils/auth";

import {
  createHoliday,
  deleteHoliday,
  fetchHolidays,
  updateHoliday,
} from "../../services/holidaysApi";

import HolidayModal from "../../components/holidays/HolidayModal";

export default function HolidaysPage() {
  const user = getAuthUser();

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selected, setSelected] =
    useState(null);

  const [error, setError] = useState("");

  const isAdmin = user.role === "admin";

  async function loadHolidays() {
    try {
      setLoading(true);

      const data = await fetchHolidays();

      setHolidays(data.holidays || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      if (selected) {
        await updateHoliday(
          selected.id,
          payload
        );
      } else {
        await createHoliday(payload);
      }

      setModalOpen(false);
      setSelected(null);

      loadHolidays();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm(
      "Delete holiday?"
    );

    if (!ok) return;

    try {
      await deleteHoliday(id);
      loadHolidays();
    } catch (err) {
      setError(err.message);
    }
  }

  function openCreate() {
    setSelected(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setSelected(item);
    setModalOpen(true);
  }

  useEffect(() => {
    loadHolidays();
  }, []);

  const activeCount = holidays.filter(
    (h) => h.status === "active"
  ).length;

  return (
    <>
      <div>
        <div className="dashboard-header employees-header">
          <div>
            <h1>Company Holidays</h1>

            <p>
              Manage yearly public and
              company holidays.
            </p>
          </div>

          {isAdmin && (
            <button
              className="employee-add-btn"
              onClick={openCreate}
            >
              <Plus size={18} />
              Add Holiday
            </button>
          )}
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="stats-grid">
          <HolidayStat
            title="Total Holidays"
            value={holidays.length}
          />

          <HolidayStat
            title="Active Holidays"
            value={activeCount}
          />

          <HolidayStat
            title="Public Holidays"
            value={
              holidays.filter(
                (i) =>
                  i.holiday_type ===
                  "public"
              ).length
            }
          />

          <HolidayStat
            title="Company Holidays"
            value={
              holidays.filter(
                (i) =>
                  i.holiday_type ===
                  "company"
              ).length
            }
          />
        </div>

        <div className="dashboard-card">
          {loading ? (
            <p>Loading holidays...</p>
          ) : (
            <div className="employee-table">
              <div className="department-row department-row-head">
                <span>Title</span>

                <span>Date</span>

                <span>Type</span>

                <span>Status</span>

                <span>Actions</span>
              </div>

              {holidays.map((item) => (
                <div
                  className="department-row"
                  key={item.id}
                >
                  <span>
                    {item.title}
                  </span>

                  <span>
                    {item.holiday_date}
                  </span>

                  <span>
                    {item.holiday_type}
                  </span>

                  <span>
                    {item.status}
                  </span>

                  <div className="employee-actions">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() =>
                            openEdit(item)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="danger"
                          onClick={() =>
                            handleDelete(
                              item.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span>
                        View Only
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <HolidayModal
        open={modalOpen}
        selected={selected}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}

function HolidayStat({
  title,
  value,
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <CalendarDays size={22} />
      </div>

      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}

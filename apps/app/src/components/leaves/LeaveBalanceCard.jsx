export default function LeaveBalanceCard({ balance }) {
  const used = Number(balance.used_days || 0);
  const allocated = Number(balance.allocated_days || 0);
  const percent = allocated ? Math.min(100, (used / allocated) * 100) : 0;

  return (
    <div className="leave-balance-card">
      <div>
        <h3>{balance.leave_type}</h3>
        <p>{balance.remaining_days} remaining</p>
      </div>

      <div className="leave-balance-numbers">
        <strong>{balance.remaining_days}</strong>
        <span>/ {balance.allocated_days}</span>
      </div>

      <div className="leave-progress">
        <div style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
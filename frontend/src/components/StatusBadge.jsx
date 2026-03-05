const StatusBadge = ({ status }) => {
  const styles = {
    requested: "bg-amber-500/20 text-amber-500 border-amber-500/50",
    accepted: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    completed: "bg-emerald-500/20 text-emerald-500 border-emerald-500/50",
    cancelled: "bg-red-500/20 text-red-500 border-red-500/50",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.requested}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default StatusBadge;
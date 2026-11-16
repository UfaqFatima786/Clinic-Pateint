export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import StatusBadge, { fmtDate } from '../components/StatusBadge.jsx';

export default function AppointmentRequests() {
  const [appts, setAppts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/appointments/doctor', { params: { search } })
      .then((r) => setAppts(r.data))
      .catch((e) => setError(errMsg(e)));

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search]);

  const setStatus = async (id, status) => {
    setError('');
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div>
      <div className="row-between">
        <h1>Appointment Requests</h1>
        <input
          className="search"
          placeholder="Search by patient name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Patient</th><th>Email</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {appts.map((a) => (
              <tr key={a._id}>
                <td>{a.patient?.name || 'Removed patient'}</td>
                <td>{a.patient?.email}</td>
                <td>{fmtDate(a.appointmentDate)}</td>
                <td>{a.appointmentTime}</td>
                <td>{a.reason}</td>
                <td><StatusBadge status={a.status} /></td>
                <td className="actions">
                  {a.status === 'pending' ? (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => setStatus(a._id, 'approved')}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setStatus(a._id, 'rejected')}>Reject</button>
                    </>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
            {appts.length === 0 && <tr><td colSpan="7" className="center muted">No requests</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

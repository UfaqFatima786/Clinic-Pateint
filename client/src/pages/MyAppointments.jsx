import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import StatusBadge, { fmtDate } from '../components/StatusBadge.jsx';

export default function MyAppointments() {
  const [appts, setAppts] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/appointments/my')
      .then((r) => setAppts(r.data))
      .catch((e) => setError(errMsg(e)));

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div>
      <h1>My Appointments</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Doctor</th><th>Specialization</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {appts.map((a) => (
              <tr key={a._id}>
                <td>{a.doctor?.name || 'Removed doctor'}</td>
                <td>{a.doctor?.specialization}</td>
                <td>{fmtDate(a.appointmentDate)}</td>
                <td>{a.appointmentTime}</td>
                <td>{a.reason}</td>
                <td><StatusBadge status={a.status} /></td>
                <td>
                  {a.status === 'pending' && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(a._id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
            {appts.length === 0 && <tr><td colSpan="7" className="center muted">No appointments yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

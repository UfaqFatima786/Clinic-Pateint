import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import StatusBadge, { fmtDate } from '../components/StatusBadge.jsx';

export default function AllAppointments() {
  const [appts, setAppts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/appointments')
      .then((r) => setAppts(r.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <div>
      <h1>All Appointments</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr>
          </thead>
          <tbody>
            {appts.map((a) => (
              <tr key={a._id}>
                <td>{a.patient?.name || 'Removed'}</td>
                <td>{a.doctor?.name || 'Removed'}</td>
                <td>{fmtDate(a.appointmentDate)}</td>
                <td>{a.appointmentTime}</td>
                <td>{a.reason}</td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            ))}
            {appts.length === 0 && <tr><td colSpan="6" className="center muted">No appointments yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

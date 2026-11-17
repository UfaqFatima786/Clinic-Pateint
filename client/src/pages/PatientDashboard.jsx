import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge, { fmtDate } from '../components/StatusBadge.jsx';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/appointments/my')
      .then((r) => setAppts(r.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  const count = (s) => appts.filter((a) => a.status === s).length;

  return (
    <div>
      <h1>Hello, {user.name} 👋</h1>
      <p className="muted">Manage your clinic visits from here.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats">
        <div className="stat"><h3>{appts.length}</h3><p>Total</p></div>
        <div className="stat"><h3>{count('pending')}</h3><p>Pending</p></div>
        <div className="stat"><h3>{count('approved')}</h3><p>Approved</p></div>
        <div className="stat"><h3>{count('rejected') + count('cancelled')}</h3><p>Rejected / Cancelled</p></div>
      </div>

      <div className="row-between">
        <h2>Recent appointments</h2>
        <Link className="btn btn-primary" to="/patient/book">+ Book appointment</Link>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr>
          </thead>
          <tbody>
            {appts.slice(0, 5).map((a) => (
              <tr key={a._id}>
                <td>{a.doctor?.name || 'Removed doctor'}</td>
                <td>{fmtDate(a.appointmentDate)}</td>
                <td>{a.appointmentTime}</td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            ))}
            {appts.length === 0 && (
              <tr><td colSpan="4" className="center muted">No appointments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/appointments/doctor')
      .then((r) => setAppts(r.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  const count = (s) => appts.filter((a) => a.status === s).length;

  return (
    <div>
      <h1>Dr. {user.name}</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card profile">
        <div className="avatar big">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h3>{user.name}</h3>
          <p className="muted">{user.email}</p>
          <p><strong>Specialization:</strong> {user.specialization || '—'}</p>
          <p><strong>Experience:</strong> {user.experience} years</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><h3>{appts.length}</h3><p>Total appointments</p></div>
        <div className="stat"><h3>{count('pending')}</h3><p>Pending</p></div>
        <div className="stat"><h3>{count('approved')}</h3><p>Approved</p></div>
        <div className="stat"><h3>{count('rejected')}</h3><p>Rejected</p></div>
      </div>

      <Link className="btn btn-primary" to="/doctor/requests">View appointment requests →</Link>
    </div>
  );
}

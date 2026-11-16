import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {stats && (
        <div className="stats">
          <div className="stat"><h3>{stats.patients}</h3><p>Registered patients</p></div>
          <div className="stat"><h3>{stats.doctors}</h3><p>Doctors</p></div>
          <div className="stat"><h3>{stats.appointments}</h3><p>Total appointments</p></div>
          <div className="stat"><h3>{stats.pending}</h3><p>Pending</p></div>
          <div className="stat"><h3>{stats.approved}</h3><p>Approved</p></div>
        </div>
      )}
    </div>
  );
}

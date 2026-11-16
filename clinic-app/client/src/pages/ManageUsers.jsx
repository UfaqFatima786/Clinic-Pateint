import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';

const empty = { name: '', email: '', password: '', specialization: '', experience: '' };

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () =>
    api
      .get('/admin/users')
      .then((r) => setUsers(r.data))
      .catch((e) => setError(errMsg(e)));

  useEffect(() => {
    load();
  }, []);

  const addDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/doctors', form);
      setSuccess('Doctor account created');
      setForm(empty);
      setShowForm(false);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const toggle = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? Their appointments will be removed too.`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div>
      <div className="row-between">
        <h1>Manage Users</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ Add Doctor'}
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form className="card form-grid" onSubmit={addDoctor}>
          <div>
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label>Specialization</label>
            <input required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          </div>
          <div>
            <label>Experience (years)</label>
            <input type="number" min="0" required value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          </div>
          <div className="form-end">
            <button className="btn btn-primary">Create Doctor</button>
          </div>
        </form>
      )}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Details</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`role role-${u.role}`}>{u.role}</span></td>
                <td>{u.role === 'doctor' ? `${u.specialization} · ${u.experience} yrs` : '—'}</td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                    {u.isActive ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn btn-outline btn-sm" onClick={() => toggle(u._id)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(u)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="6" className="center muted">No users yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

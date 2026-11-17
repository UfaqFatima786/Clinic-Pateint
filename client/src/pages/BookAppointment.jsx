import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';

const today = () => new Date().toISOString().split('T')[0];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ appointmentDate: '', appointmentTime: '', reason: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // search doctors by name or specialization (debounced)
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const t = setTimeout(() => {
      setLoadingDoctors(true);
      setError('');
      api
        .get('/doctors', { params: { search: search.trim() }, signal: controller.signal })
        .then((r) => {
          if (active) setDoctors(r.data);
        })
        .catch((e) => {
          if (!active || e.code === 'ERR_CANCELED') return;
          setDoctors([]);
          setError(errMsg(e));
        })
        .finally(() => {
          if (active) setLoadingDoctors(false);
        });
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
      controller.abort();
    };
  }, [search]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selected) return setError('Please select a doctor first');
    setLoading(true);
    try {
      await api.post('/appointments', { doctor: selected._id, ...form });
      setSuccess('Appointment requested! Waiting for doctor approval.');
      setTimeout(() => navigate('/patient/appointments'), 1200);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Book an Appointment</h1>

      <div className="two-col">
        <section>
          <h2>1. Choose a doctor</h2>
          <input
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="doctor-list">
            {doctors.map((d) => (
              <button
                key={d._id}
                type="button"
                className={`card doctor-card ${selected?._id === d._id ? 'selected' : ''}`}
                aria-pressed={selected?._id === d._id}
                onClick={() => setSelected(d)}
              >
                <div className="avatar">{d.name.charAt(0).toUpperCase()}</div>
                <div>
                  <h3>{d.name}</h3>
                  <p className="muted">{d.specialization}</p>
                  <p className="muted">{d.experience} years experience</p>
                </div>
              </button>
            ))}
            {!loadingDoctors && doctors.length === 0 && (
              <p className="muted">
                {search.trim()
                  ? 'No doctors match your search.'
                  : 'No doctors are available yet. Please contact the clinic administrator.'}
              </p>
            )}
          </div>
        </section>

        <section>
          <h2>2. Appointment details</h2>
          <form className="card" onSubmit={submit}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <label>Selected doctor</label>
            <input disabled value={selected ? `${selected.name} (${selected.specialization})` : 'None selected'} />
            <label>Date</label>
            <input
              type="date"
              required
              min={today()}
              value={form.appointmentDate}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
            />
            <label>Time</label>
            <input
              type="time"
              required
              value={form.appointmentTime}
              onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
            />
            <label>Reason for visit</label>
            <textarea
              required
              rows="3"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = {
  patient: [
    ['/patient', 'Dashboard'],
    ['/patient/book', 'Book Appointment'],
    ['/patient/appointments', 'My Appointments'],
  ],
  doctor: [
    ['/doctor', 'Dashboard'],
    ['/doctor/requests', 'Appointment Requests'],
  ],
  admin: [
    ['/admin', 'Dashboard'],
    ['/admin/users', 'Manage Users'],
    ['/admin/appointments', 'All Appointments'],
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <header className="navbar">
      <div className="brand">+ MediCare Clinic</div>
      <nav>
        {LINKS[user.role].map(([to, label]) => (
          <NavLink key={to} to={to} end={to.split('/').length === 2}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-user">
        <span>
          {user.name} <small className={`role role-${user.role}`}>{user.role}</small>
        </span>
        <button
          className="btn btn-outline"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

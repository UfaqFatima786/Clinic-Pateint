import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

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
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const navRef = useRef(null);

  useLayoutEffect(() => {
    if (!headerRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        '.brand, .menu-toggle, .nav-user',
        { autoAlpha: 0, y: -10 },
        { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.055, ease: 'power2.out', clearProps: 'all' }
      );
    }, headerRef);

    return () => context.revert();
  }, []);

  useLayoutEffect(() => {
    if (
      !menuOpen ||
      !navRef.current ||
      window.innerWidth > 999 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        navRef.current.children,
        { autoAlpha: 0, y: -8 },
        { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.04, ease: 'power2.out', clearProps: 'all' }
      );
    }, navRef);

    return () => context.revert();
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar" ref={headerRef}>
      <Link className="brand" to={user ? `/${user.role}` : '/login'}>
        <span className="brand-mark" aria-hidden="true">+</span>
        <span>MediCare <strong>Clinic</strong></span>
      </Link>
      <button
        className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
        type="button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav id="primary-navigation" className={menuOpen ? 'nav-open' : ''} ref={navRef}>
        {user ? (
          LINKS[user.role].map(([to, label]) => (
            <NavLink key={to} to={to} end={to.split('/').length === 2}>
              {label}
            </NavLink>
          ))
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Create account</NavLink>
          </>
        )}
        <button
          className="btn btn-outline theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
          <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </button>
      </nav>
      {user && (
        <div className="nav-user">
          <span className="nav-user-name">
            {user.name} <small className={`role role-${user.role}`}>{user.role}</small>
          </span>
          <button
            className="btn btn-outline logout-button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

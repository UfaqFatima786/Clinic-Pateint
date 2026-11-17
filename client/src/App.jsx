import { useLayoutEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth, homePath } from './context/AuthContext.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import MyAppointments from './pages/MyAppointments.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import AppointmentRequests from './pages/AppointmentRequests.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import AllAppointments from './pages/AllAppointments.jsx';

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const pageRef = useRef(null);

  const guard = (roles, el) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

  useLayoutEffect(() => {
    if (!pageRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        pageRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.card, .stat',
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.045, delay: 0.08, ease: 'power2.out' }
      );
    }, pageRef);

    return () => context.revert();
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main ref={pageRef} className="container" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Navigate to={user ? homePath(user.role) : '/login'} replace />} />
          <Route path="/login" element={user ? <Navigate to={homePath(user.role)} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={homePath(user.role)} replace /> : <Register />} />

          <Route path="/patient" element={guard(['patient'], <PatientDashboard />)} />
          <Route path="/patient/book" element={guard(['patient'], <BookAppointment />)} />
          <Route path="/patient/appointments" element={guard(['patient'], <MyAppointments />)} />

          <Route path="/doctor" element={guard(['doctor'], <DoctorDashboard />)} />
          <Route path="/doctor/requests" element={guard(['doctor'], <AppointmentRequests />)} />

          <Route path="/admin" element={guard(['admin'], <AdminDashboard />)} />
          <Route path="/admin/users" element={guard(['admin'], <ManageUsers />)} />
          <Route path="/admin/appointments" element={guard(['admin'], <AllAppointments />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

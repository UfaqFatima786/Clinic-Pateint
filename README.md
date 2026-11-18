# Clinic Appointment Management System (MERN)

```
clinic-app/
├── server/   Express + MongoDB + JWT + bcrypt
└── client/   React (Vite) + React Router + Axios
```

## Setup (step by step)

### 1. Backend
```bash
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
```
`.env` mein `MONGO_URI` apna set karein (local MongoDB ya Atlas) aur `JWT_SECRET` koi bhi lamba random text.

```bash
npm run seed    # admin account aur 4 demo doctors banata hai
npm run dev     # http://localhost:5000
```
Admin login: **admin@clinic.com / admin123**
Seed command naye demo doctor accounts ke randomly generated passwords terminal mein ek baar dikhata hai. Un passwords ko save karein; dobara seed chalane par pehle se maujood doctors duplicate nahi honge.

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev     # http://localhost:5173
```

## Demo flow (instructor scenario)
1. Admin login -> Manage Users -> Add Doctor (Dr. Ahmed, Cardiologist, 5 years)
2. Logout -> Register as patient -> Book Appointment -> search "Ahmed" -> select -> date/time/reason
3. Logout -> Login as Dr. Ahmed -> Appointment Requests -> Approve
4. Login as patient -> My Appointments -> status Approved
5. Login as admin -> All Appointments + Manage Users

## API
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/doctors?search= | Authenticated |
| GET | /api/doctors/:id | Authenticated |
| POST | /api/appointments | Patient |
| GET | /api/appointments/my | Patient |
| GET | /api/appointments/doctor | Doctor |
| PATCH | /api/appointments/:id/status | Doctor |
| PATCH | /api/appointments/:id/cancel | Patient |
| GET | /api/admin/users | Admin |
| POST | /api/admin/doctors | Admin |
| PATCH | /api/admin/users/:id/toggle | Admin |
| DELETE | /api/admin/users/:id | Admin |
| GET | /api/admin/appointments | Admin |
| GET | /api/admin/stats | Admin |

## Deploy (agar chahiye)
- Database: MongoDB Atlas (free)
- Backend ko Vercel par alag project ke taur par deploy karein aur Root Directory `server` rakhein. Is project mein `MONGO_URI`, `JWT_SECRET`, aur `CLIENT_URL` env vars set karein. `CLIENT_URL` mein deployed frontend ka origin dein, misaal: `https://clinic-pateint.vercel.app`.
- Frontend ke liye doosra Vercel project banayein aur Root Directory `client` rakhein. `VITE_API_URL` ko backend ke deployed origin ke saath `/api` par set karein, misaal: `https://your-backend.vercel.app/api`.
- Dono projects ke env vars save karne ke baad redeploy karein. Local `.env` ki `localhost` value deployed build mein istemal nahi honi chahiye.
- API routes POST/GET methods ke mutabiq hain. Browser address bar se `/api/auth/login` kholne par GET hota hai; login aur registration ko frontend form se test karein, kyun ke dono POST requests hain.

# 🗳 UniVote — Student Council Election Portal

A full-stack MERN application for managing college student council elections with role-based access for Root, Admin, Nominals, and Voters.

---

## 📁 Project Structure

```
voting-system/
├── backend/
│   ├── models/
│   │   ├── User.js          # All users (root/admin/voter/nominal)
│   │   ├── Club.js          # Clubs with 4 posts each
│   │   ├── Nominal.js       # Candidates with vote counts
│   │   ├── Notice.js        # Notices/updates from admins
│   │   └── Election.js      # Election open/close + results flag
│   ├── routes/
│   │   ├── auth.js          # Login endpoints
│   │   ├── root.js          # Root-only: manage admins, election control
│   │   ├── admin.js         # Admin: clubs, nominals, voters, notices
│   │   ├── voter.js         # Voting + status
│   │   └── public.js        # Public data (no auth)
│   ├── middleware/
│   │   └── auth.js          # JWT + role guard
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.jsx    # JWT + user state
        ├── utils/
        │   └── api.js             # Axios instance
        ├── components/
        │   └── Navbar.jsx
        ├── pages/
        │   ├── Login.jsx          # Voter/Admin/Nominal login
        │   ├── RootLogin.jsx      # Root-only login
        │   ├── voter/
        │   │   ├── VoterDashboard.jsx   # Home with GS/VGS/Clubs buttons
        │   │   ├── VotingSection.jsx    # Candidate cards + radio vote
        │   │   ├── ClubsList.jsx        # List of clubs
        │   │   ├── NoticeFeed.jsx       # Notices from admins
        │   │   └── MyNominalCard.jsx    # Nominal's own candidacy info
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx   # Tabbed admin panel
        │   │   ├── AdminStats.jsx       # Turnout stats
        │   │   ├── AdminNominals.jsx    # CRUD nominals
        │   │   ├── AdminClubs.jsx       # CRUD clubs
        │   │   ├── AdminVoters.jsx      # CRUD voters
        │   │   └── AdminNotices.jsx     # CRUD notices/updates
        │   └── root/
        │       ├── RootDashboard.jsx    # Full-access panel
        │       ├── RootAdmins.jsx       # CRUD admins
        │       ├── RootElection.jsx     # Open/close voting, publish results
        │       └── RootResults.jsx      # Live vote counts with bar chart
        ├── App.jsx
        ├── index.js
        └── index.css
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

---

### 1. Clone / place the project

```bash
cd voting-system
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the env file and configure it:
```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb://localhost:27017/studentvoting
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
CLIENT_URL=http://localhost:3000
ROOT_USERNAME=root
ROOT_PASSWORD=root@123
```

> ⚠️ Change `ROOT_PASSWORD` before going live.

Start the backend:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

> The frontend proxies `/api/*` to `http://localhost:5000` via the `"proxy"` field in `package.json`.

---

## 👥 Roles & Access

| Role | Login | Access |
|------|-------|--------|
| **Root** | `/root/login` with username+password from `.env` | Full access: manage admins, open/close elections, see live results |
| **Admin** | `/login` with college ID | Manage clubs, nominals, voters, notices; see stats |
| **Voter** | `/login` with college ID | Vote for GS, VGS, club posts; see notices |
| **Nominal** | `/login` with college ID | See their own candidacy; vote for all posts they are NOT nominated for |

---

## 🗺 How The App Works

### Voter Flow
1. Login with college ID + password
2. Homepage shows: **GS**, **VGS**, **Clubs** buttons + notice feed
3. Click **GS/VGS** → see candidates as clickable cards → select one → submit vote
4. Click **Clubs** → list of clubs → click a club → see 4 posts (President, VP, Secretary, Treasurer) → vote for each
5. Once voted for a post, it is marked ✓ and cannot be changed

### Nominal Flow
- Login shows a "Your Candidacy" card with their post + description
- They **cannot** vote for the post they are nominated for
- They **can** vote for all other posts like a regular voter

### Admin Flow
1. Login → tabbed panel:
   - **Overview** — voter count, turnout %, active clubs/nominals
   - **Nominals** — add (by college ID), edit, remove; upload photo + manifesto
   - **Clubs** — create/edit/delete clubs with logo
   - **Voters** — add/edit/delete voters; search by name or ID
   - **Noticeboard** — post/edit/delete notices, updates, result announcements

### Root Flow
Everything Admin can do, plus:
- **Admins** tab — create/edit/delete admin accounts
- **Election Control** — toggle voting open/closed, publish results, set start/end time
- **Results** — live vote counts with progress bars, winner highlighted in gold

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Voter/Admin/Nominal login |
| POST | `/api/auth/root/login` | Root login |

### Public (no auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/election` | Election open/closed status |
| GET | `/api/public/clubs` | All active clubs |
| GET | `/api/public/nominals/:postType` | GS or VGS candidates |
| GET | `/api/public/clubs/:clubId/nominals` | Club candidates grouped by post |
| GET | `/api/public/notices` | Published notices |
| GET | `/api/public/results` | Results (only if published) |

### Voter (JWT required, role: voter/nominal)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/voter/status` | My voting status |
| GET | `/api/voter/my-nominal` | My nomination info |
| POST | `/api/voter/vote` | Cast a vote `{ nominalId, postType, clubId? }` |

### Admin (JWT required, role: admin/root)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/voters` | List / add voter |
| PUT/DELETE | `/api/admin/voters/:id` | Update / delete voter |
| GET/POST | `/api/admin/clubs` | List / create club |
| PUT/DELETE | `/api/admin/clubs/:id` | Update / delete club |
| GET/POST | `/api/admin/nominals` | List / add nominal |
| PUT/DELETE | `/api/admin/nominals/:id` | Update / delete nominal |
| GET/POST | `/api/admin/notices` | List / post notice |
| PUT/DELETE | `/api/admin/notices/:id` | Update / delete notice |
| GET | `/api/admin/stats` | Election stats |

### Root (JWT required, role: root)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/root/admins` | List / create admin |
| PUT/DELETE | `/api/root/admins/:id` | Update / delete admin |
| GET/PUT | `/api/root/election` | Get / update election settings |
| GET | `/api/root/results` | All nominals with vote counts |
| GET | `/api/root/stats` | Global stats |

---

## 🛡 Security Notes

- Passwords are **bcrypt hashed** (salt rounds: 10)
- JWTs expire in **7 days**
- Votes are **one-per-post per user** — enforced server-side
- Nominals **cannot vote** for their own post — enforced server-side
- All admin/root routes are **role-guarded** via middleware
- Photo uploads are **size-limited** to 2MB via multer

---

## 📦 Production Build

```bash
# Build React app
cd frontend
npm run build

# Serve static files from Express (add to server.js):
# app.use(express.static(path.join(__dirname, '../frontend/build')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
```

---

## 🔧 Customisation Tips

- **Add more club posts**: Update the `postType` enum in `Nominal.js` and add to `POST_LABELS` in frontend
- **Email OTP login**: Integrate nodemailer + OTP in `auth.js`
- **Bulk voter import**: Use the `/api/admin/voters/bulk` endpoint with a JSON array
- **Photo storage**: Replace local `uploads/` folder with AWS S3 or Cloudinary for production
- **Results display**: The public results page can be enabled by setting `resultsPublished: true` from Root panel

---

## 🧪 Quick Test Data

After starting the backend, use these curl commands to quickly seed test data:

```bash
# Root login
curl -X POST http://localhost:5000/api/auth/root/login \
  -H "Content-Type: application/json" \
  -d '{"username":"root","password":"root@123"}'

# Use the returned token as: -H "Authorization: Bearer <token>"
```

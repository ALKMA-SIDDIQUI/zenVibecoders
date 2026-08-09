# ABTalks - 60 Day Developer Challenge

A fully functional, locally-runnable **60-Day Developer Challenge** web application with real GitHub integration, avatar uploads, activity calendar with date tooltips, local database persistence, and a complete settings panel.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-stable-green.svg)

---

## Features

### Core Challenge System
- **60 Daily Coding Challenges** — curated projects from beginner to advanced
- **XP & Streak Tracking** — earn XP, maintain streaks, unlock badges
- **Progress Dashboard** — visual progress ring, activity calendar, stats cards
- **Leaderboard** — compete with mock users + your own progress

### Activity Calendar
- **Hover or Click** any day cell to see exact **date & month** (e.g., "Day 15 — August 23, 2026")
- Color-coded: Green (completed), Purple (current), Red (missed), Gray (upcoming)
- Works on both Landing page and Dashboard

### User Authentication
- **Email/Password Sign Up & Sign In** — fully functional local auth
- **Session Management** — 7-day auto-login sessions
- **Password Validation** — min 8 chars, match confirmation

### Profile System
- **Avatar Upload** — drag & drop or click to upload (JPG/PNG/GIF, max 2MB)
- **Editable Profile** — name, bio, location, website
- **Stats Display** — XP, streak, completed days
- **Achievement Badges** — 7 unlockable badges with lock/unlock states
- **Contributions Timeline** — view all submitted challenges with links

### Real GitHub Integration
- **Connect via Personal Access Token (PAT)** — no backend server needed
- **Live GitHub Stats** — repos, followers, following
- **Recent Repositories List** — with language, stars, direct links
- **Refresh Data** — pull latest GitHub data anytime
- **Disconnect** — remove connection instantly

> To generate a PAT: [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token → Select `repo` and `user` scopes

### Settings Panel (Fully Functional)
| Panel | Features |
|-------|----------|
| **Profile** | Upload avatar, edit name/bio/location/website |
| **Account** | View email, change password (requires current password) |
| **Notifications** | Toggle reminders/email/leaderboard alerts, set reminder time |
| **GitHub** | Connect PAT, view live stats & repos, refresh, disconnect |
| **Data** | Export all data to JSON, import from JSON backup |
| **Danger Zone** | Reset all progress, permanently delete account |

### Local Database
- **Zero Backend Required** — uses browser `localStorage`
- **Persistent Storage** — survives browser restarts
- **Structured Data** — users, contributions, leaderboard, settings
- **Data Export/Import** — backup and restore your entire account

### UI/UX
- **Dark Glassmorphism Theme** — modern purple-gradient design
- **Responsive Layout** — works on desktop, tablet, and mobile
- **Bottom Navigation** — mobile-friendly nav bar
- **Toast Notifications** — success, error, info, warning alerts
- **Smooth Animations** — fade-ins, slide-ins, glow effects, checkmark animations
- **Modal System** — auth guard, success overlay, confirm dialogs, avatar upload, GitHub connect

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Styling** | CSS Custom Properties, Flexbox, CSS Grid, Glassmorphism |
| **Database** | Browser LocalStorage (JSON-based) |
| **Icons** | Font Awesome 6.4 |
| **Fonts** | Inter, JetBrains Mono (Google Fonts) |
| **External APIs** | GitHub REST API v3 |

---

## File Structure

```
abtalks/
├── index.html              # Main entry point (all 6 pages in one file)
├── css/
│   └── style.css           # Complete design system & component styles
└── js/
    ├── database.js         # LocalStorage DB layer (users, contributions, settings)
    ├── app.js              # Main app controller, routing, auth, dashboard, challenge
    ├── calendar.js         # Enhanced calendar with date/month tooltip
    ├── github.js           # Real GitHub API integration via PAT
    ├── profile.js          # Profile display, avatar upload, section switching
    └── settings.js         # Fully functional settings panels
```

---

## Quick Start

### 1. Download & Extract
```bash
# Extract the zip file
unzip abtalks.zip

# Navigate into the folder
cd abtalks
```

### 2. Run the App

#### Option A: Direct Open (Simplest)
Just double-click `index.html` or open it in any browser.

> **Note:** GitHub API connection requires Option B due to browser CORS restrictions on `file://` URLs.

#### Option B: Local Server (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```
Then open: **`http://localhost:8000`**

---

## Usage Guide

### First Time Setup
1. Click **"Get Started Free"** on the landing page
2. Switch to **Sign Up** tab
3. Enter your name, email, and password (min 8 characters)
4. Click **Create Account** — you'll be auto-logged in

### Daily Challenge Flow
1. Go to **Dashboard** — see your progress & today's day
2. Click **Challenge** — read the task description & resources
3. Build the project locally on your machine
4. Push to GitHub
5. Paste the GitHub repo URL in the submission box
6. Click **Submit** — earn XP and see the success animation!

### Connect Real GitHub
1. Go to **Profile → Connected Accounts** or **Settings → GitHub**
2. Click **Connect**
3. Enter your GitHub Personal Access Token
   - Get one at: [github.com/settings/tokens](https://github.com/settings/tokens)
   - Required scopes: `repo`, `user`
4. Your real GitHub stats and repos will appear instantly

### Upload Avatar
1. Go to **Profile** → click the **camera icon** on your avatar
2. Drag & drop an image or click to browse
3. Click **Save Avatar**

### Backup Your Data
1. Go to **Settings → Data**
2. Click **Export to JSON** — downloads a backup file
3. To restore later: click **Import from JSON** and select your backup

---

## Database Architecture

The app uses a client-side JSON database stored in `localStorage`:

```json
{
  "users": [
    {
      "id": "user_123...",
      "name": "John Doe",
      "email": "john@example.com",
      "password": "hashed_or_plain",
      "avatar": "data:image/png;base64,...",
      "bio": "Aspiring developer",
      "location": "New York, USA",
      "website": "https://johndoe.com",
      "githubUsername": "johndoe",
      "githubToken": "ghp_...",
      "githubData": { ... },
      "settings": {
        "notifications": true,
        "emailUpdates": true,
        "publicProfile": true,
        "reminderTime": "09:00"
      },
      "xp": 1250,
      "streak": 5,
      "longestStreak": 12,
      "currentDay": 6,
      "completedDays": [1, 2, 3, 4, 5],
      "badges": ["starter", "week_streak"],
      "startDate": "2026-08-01T00:00:00.000Z"
    }
  ],
  "contributions": [
    {
      "id": "contrib_123...",
      "userId": "user_123...",
      "day": 1,
      "title": "Build a Personal Portfolio",
      "githubUrl": "https://github.com/user/portfolio",
      "xpEarned": 250,
      "completedAt": "2026-08-01T10:30:00.000Z"
    }
  ],
  "leaderboard": [ ... ],
  "version": "1.0.0"
}
```

### Key Database Methods (in `database.js`)

| Method | Purpose |
|--------|---------|
| `Database.register(name, email, password)` | Create new user |
| `Database.login(email, password)` | Authenticate user |
| `Database.logout()` | Clear session |
| `Database.getCurrentUser()` | Get logged-in user (safe) |
| `Database.updateUser(updates)` | Update profile fields |
| `Database.updatePassword(current, new)` | Change password |
| `Database.deleteAccount(password)` | Permanently delete user |
| `Database.updateAvatar(base64)` | Save avatar image |
| `Database.addContribution(data)` | Log completed challenge |
| `Database.updateSettings(settings)` | Save user preferences |
| `Database.connectGithub(token, username, data)` | Link GitHub |
| `Database.exportData()` | Export user data as JSON |
| `Database.importData(json)` | Restore from JSON |
| `Database.resetProgress()` | Reset all challenge progress |

---

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome 90+ | Fully Supported |
| Edge 90+ | Fully Supported |
| Firefox 88+ | Fully Supported |
| Safari 14+ | Fully Supported |
| Opera 76+ | Fully Supported |

---

## Security Notes

- **Passwords** are stored in plain text in LocalStorage (acceptable for local demo use)
- **GitHub PAT** is stored locally in your browser only — never sent to any server except GitHub's official API
- **No data leaves your machine** except GitHub API calls (which use your token directly)
- For production, implement server-side hashing and JWT authentication

---

## Customization

### Change Challenge Topics
Edit `js/app.js` → `loadChallenges()` method:

```javascript
const titles = [
    "Your Custom Challenge 1",
    "Your Custom Challenge 2",
    // ... 60 total
];
```

### Change Theme Colors
Edit `css/style.css` → `:root` variables:

```css
:root {
    --accent-primary: #6366f1;    /* Change primary color */
    --success: #22c55e;           /* Change success color */
    --danger: #ef4444;            /* Change danger color */
}
```

### Add More Badges
Edit `js/profile.js` → `badgeMap` object and `js/database.js` → badge logic in `addContribution()`.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page looks unstyled | Ensure `css/style.css` exists in the `css/` folder |
| JavaScript not working | Check browser console (F12) for errors |
| GitHub connect fails | Use a local server (`python -m http.server 8000`) instead of opening `file://` |
| Data lost after clearing cookies | Export data regularly from Settings → Data |
| Avatar upload fails | Ensure image is under 2MB and is JPG/PNG/GIF |
| Stuck on loading | Hard refresh: `Ctrl + Shift + R` or clear LocalStorage |

---

## Roadmap / Future Enhancements

- [ ] Backend API with Node.js + MongoDB for multi-user cloud sync
- [ ] Real LinkedIn OAuth integration
- [ ] Email notifications via SendGrid
- [ ] Push notifications for daily reminders
- [ ] Dark/Light theme toggle
- [ ] PWA support (offline mode)
- [ ] Social features (follow users, comments)
- [ ] AI-generated challenge feedback (OpenAI API)

---

## License

MIT License — free to use, modify, and distribute.

---

## Credits

- **Fonts**: [Google Fonts](https://fonts.google.com) (Inter, JetBrains Mono)
- **Icons**: [Font Awesome](https://fontawesome.com) 6.4
- **Design Inspiration**: Glassmorphism UI trend
- **GitHub API**: [docs.github.com](https://docs.github.com/en/rest)

---

## Support

For issues or feature requests, check the browser console (F12) for error messages first. Most issues are related to:
1. Missing files (check folder structure)
2. Browser security blocking `fetch()` from `file://` URLs (use local server)
3. Corrupted LocalStorage (clear and restart)

---

**Built with vanilla HTML, CSS, and JavaScript. No frameworks. No build step. Just works.**

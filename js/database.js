/**
 * ABTalks Local Database Layer
 * Uses LocalStorage for persistence - zero backend required
 */

const DB_KEY = 'abtalks_db';
const SESSION_KEY = 'abtalks_session';

const Database = {
    // Initialize database with defaults
    init() {
        if (!localStorage.getItem(DB_KEY)) {
            const defaultDB = {
                users: [],
                contributions: [],
                leaderboard: this.generateMockLeaderboard(),
                version: '1.0.0'
            };
            localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
        }
        return this.getDB();
    },

    getDB() {
        return JSON.parse(localStorage.getItem(DB_KEY) || '{}');
    },

    saveDB(db) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    },

    generateMockLeaderboard() {
        const names = ['Alex Chen', 'Maria Garcia', 'James Wilson', 'Priya Patel', 'David Kim', 'Emma Thompson', 'Raj Singh', 'Lisa Wong'];
        return names.map((name, i) => ({
            id: `mock_${i}`,
            name,
            avatar: null,
            xp: Math.floor(Math.random() * 5000) + 2000,
            streak: Math.floor(Math.random() * 45) + 5,
            longestStreak: Math.floor(Math.random() * 50) + 10,
            completedDays: Math.floor(Math.random() * 40) + 10,
            badges: Math.floor(Math.random() * 8) + 2
        })).sort((a, b) => b.xp - a.xp);
    },

    // User Management
    register(name, email, password) {
        const db = this.getDB();
        if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'Email already registered' };
        }

        const user = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name,
            email: email.toLowerCase(),
            password, // In production, hash this. For local demo, plain text is acceptable.
            avatar: null,
            bio: '',
            location: '',
            website: '',
            githubUsername: '',
            githubToken: '',
            githubData: null,
            linkedinConnected: false,
            settings: {
                notifications: true,
                emailUpdates: true,
                publicProfile: true,
                theme: 'dark',
                autoSync: false,
                reminderTime: '09:00'
            },
            xp: 0,
            streak: 0,
            longestStreak: 0,
            currentDay: 1,
            startDate: new Date().toISOString(),
            contributions: [],
            completedDays: [],
            badges: ['starter'],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        db.users.push(user);
        this.saveDB(db);
        return { success: true, user: this.sanitizeUser(user) };
    },

    login(email, password) {
        const db = this.getDB();
        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { success: false, error: 'User not found' };
        if (user.password !== password) return { success: false, error: 'Invalid password' };

        user.lastActive = new Date().toISOString();
        this.saveDB(db);

        // Create session
        const session = {
            userId: user.id,
            token: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return { success: true, user: this.sanitizeUser(user) };
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
        return true;
    },

    getCurrentUser() {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (!session || Date.now() > session.expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        const db = this.getDB();
        const user = db.users.find(u => u.id === session.userId);
        return user ? this.sanitizeUser(user) : null;
    },

    getFullUser() {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (!session) return null;
        const db = this.getDB();
        return db.users.find(u => u.id === session.userId) || null;
    },

    updateUser(updates) {
        const db = this.getDB();
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (!session) return { success: false, error: 'Not authenticated' };

        const idx = db.users.findIndex(u => u.id === session.userId);
        if (idx === -1) return { success: false, error: 'User not found' };

        // Prevent overwriting critical fields accidentally
        const protectedFields = ['id', 'createdAt', 'contributions', 'completedDays', 'badges'];
        protectedFields.forEach(f => delete updates[f]);

        db.users[idx] = { ...db.users[idx], ...updates, lastActive: new Date().toISOString() };
        this.saveDB(db);
        return { success: true, user: this.sanitizeUser(db.users[idx]) };
    },

    updatePassword(currentPassword, newPassword) {
        const user = this.getFullUser();
        if (!user) return { success: false, error: 'Not authenticated' };
        if (user.password !== currentPassword) return { success: false, error: 'Current password is incorrect' };

        return this.updateUser({ password: newPassword });
    },

    deleteAccount(password) {
        const user = this.getFullUser();
        if (!user) return { success: false, error: 'Not authenticated' };
        if (user.password !== password) return { success: false, error: 'Password is incorrect' };

        const db = this.getDB();
        db.users = db.users.filter(u => u.id !== user.id);
        this.saveDB(db);
        this.logout();
        return { success: true };
    },

    // Avatar: base64 storage
    updateAvatar(base64Image) {
        return this.updateUser({ avatar: base64Image });
    },

    // Challenge / Contributions
    addContribution(data) {
        const user = this.getFullUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const contribution = {
            id: 'contrib_' + Date.now(),
            userId: user.id,
            day: data.day,
            title: data.title,
            description: data.description,
            githubUrl: data.githubUrl || '',
            linkedinUrl: data.linkedinUrl || '',
            xpEarned: data.xp || 100,
            completedAt: new Date().toISOString()
        };

        const db = this.getDB();
        db.contributions.push(contribution);

        const uIdx = db.users.findIndex(u => u.id === user.id);
        if (uIdx !== -1) {
            db.users[uIdx].contributions.push(contribution.id);
            db.users[uIdx].completedDays.push(data.day);
            db.users[uIdx].xp += data.xp || 100;
            db.users[uIdx].currentDay = Math.max(db.users[uIdx].currentDay, data.day + 1);

            // Streak logic
            const today = new Date().toDateString();
            const lastContrib = db.users[uIdx].contributions.length > 1
                ? db.contributions.find(c => c.id === db.users[uIdx].contributions[db.users[uIdx].contributions.length - 2])
                : null;

            if (lastContrib) {
                const lastDate = new Date(lastContrib.completedAt);
                const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
                if (diffDays <= 1) {
                    db.users[uIdx].streak += 1;
                } else {
                    db.users[uIdx].streak = 1;
                }
            } else {
                db.users[uIdx].streak = 1;
            }

            if (db.users[uIdx].streak > db.users[uIdx].longestStreak) {
                db.users[uIdx].longestStreak = db.users[uIdx].streak;
            }

            // Badges
            const badges = new Set(db.users[uIdx].badges);
            if (db.users[uIdx].streak >= 7) badges.add('week_streak');
            if (db.users[uIdx].streak >= 30) badges.add('month_streak');
            if (db.users[uIdx].xp >= 1000) badges.add('xp_1k');
            if (db.users[uIdx].xp >= 5000) badges.add('xp_5k');
            if (db.users[uIdx].completedDays.length >= 30) badges.add('halfway');
            if (db.users[uIdx].completedDays.length >= 60) badges.add('completionist');
            db.users[uIdx].badges = Array.from(badges);
        }

        this.saveDB(db);
        return { success: true, contribution };
    },

    getUserContributions() {
        const user = this.getFullUser();
        if (!user) return [];
        const db = this.getDB();
        return db.contributions.filter(c => c.userId === user.id);
    },

    getLeaderboard() {
        const db = this.getDB();
        const currentUser = this.getCurrentUser();
        const userEntries = db.users.map(u => ({
            id: u.id,
            name: u.name,
            avatar: u.avatar,
            xp: u.xp,
            streak: u.streak,
            longestStreak: u.longestStreak,
            completedDays: u.completedDays.length,
            badges: u.badges.length
        }));

        const allEntries = [...db.leaderboard, ...userEntries]
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 20);

        return allEntries.map((entry, idx) => ({
            ...entry,
            rank: idx + 1,
            isCurrentUser: currentUser && entry.id === currentUser.id
        }));
    },

    // Settings
    updateSettings(newSettings) {
        const user = this.getFullUser();
        if (!user) return { success: false };
        const merged = { ...user.settings, ...newSettings };
        return this.updateUser({ settings: merged });
    },

    // GitHub Integration
    connectGithub(token, username, githubData) {
        return this.updateUser({
            githubToken: token,
            githubUsername: username,
            githubData: githubData
        });
    },

    disconnectGithub() {
        return this.updateUser({
            githubToken: '',
            githubUsername: '',
            githubData: null
        });
    },

    // Data Export / Import
    exportData() {
        const user = this.getFullUser();
        if (!user) return null;
        const db = this.getDB();
        const userContribs = db.contributions.filter(c => c.userId === user.id);
        return {
            user: this.sanitizeUser(user),
            contributions: userContribs,
            exportedAt: new Date().toISOString()
        };
    },

    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (data.user && data.contributions) {
                const db = this.getDB();
                const idx = db.users.findIndex(u => u.id === data.user.id);
                if (idx !== -1) {
                    db.users[idx] = { ...db.users[idx], ...data.user };
                }
                // Merge contributions
                data.contributions.forEach(c => {
                    if (!db.contributions.find(ec => ec.id === c.id)) {
                        db.contributions.push(c);
                    }
                });
                this.saveDB(db);
                return { success: true };
            }
            return { success: false, error: 'Invalid data format' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    sanitizeUser(user) {
        const { password, githubToken, ...safe } = user;
        return safe;
    },

    // Reset progress
    resetProgress() {
        const user = this.getFullUser();
        if (!user) return { success: false };
        const db = this.getDB();
        const idx = db.users.findIndex(u => u.id === user.id);
        if (idx === -1) return { success: false };

        db.users[idx].xp = 0;
        db.users[idx].streak = 0;
        db.users[idx].longestStreak = 0;
        db.users[idx].currentDay = 1;
        db.users[idx].completedDays = [];
        db.users[idx].contributions = [];
        db.users[idx].badges = ['starter'];
        db.users[idx].startDate = new Date().toISOString();

        db.contributions = db.contributions.filter(c => c.userId !== user.id);
        this.saveDB(db);
        return { success: true };
    }
};

// Auto-init
Database.init();

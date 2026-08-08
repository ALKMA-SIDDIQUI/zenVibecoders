/**
 * ABTalks Main Application Controller
 */

const app = {
    currentPage: 'landing',
    user: null,
    challenges: [],

    init() {
        this.loadChallenges();
        this.checkSession();
        this.setupNavScroll();
        this.setupCalendarTooltip();
        window.addEventListener('popstate', () => this.handlePopState());

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            const avatar = document.getElementById('navAvatar');
            if (dropdown && avatar && !dropdown.contains(e.target) && !avatar.contains(e.target)) {
                this.closeUserDropdown();
            }
        });
    },

    loadChallenges() {
        // 60 days of challenges data
        const titles = [
            "Build a Personal Portfolio","Create a Todo App","Build a Weather Dashboard","Create a Calculator",
            "Build a Countdown Timer","Create a Markdown Previewer","Build a Drum Machine","Create a Random Quote Generator",
            "Build a Pomodoro Clock","Create a JavaScript Piano","Build a Memory Game","Create a Tic Tac Toe Game",
            "Build a Snake Game","Create a Pong Game","Build a Chat Interface","Create a File Uploader",
            "Build an Image Gallery","Create a Carousel Slider","Build a Modal System","Create a Toast Notification",
            "Build a Drag & Drop Board","Create a Kanban Board","Build a Color Palette Generator","Create a CSS Gradient Generator",
            "Build a Password Generator","Create a QR Code Generator","Build a Unit Converter","Create a BMI Calculator",
            "Build a Loan Calculator","Create a Tip Calculator","Build a Currency Converter","Create a World Clock",
            "Build a Stopwatch","Create a Drawing App","Build a Music Player UI","Create a Video Player UI",
            "Build a Responsive Navbar","Create a Sidebar Layout","Build a Dashboard Grid","Create a Login/Register Forms",
            "Build a Multi-step Wizard","Create a Survey Form","Build a Search Filter","Create a Pagination Component",
            "Build an Infinite Scroll","Create a Lazy Load Images","Build a Skeleton Loader","Create a Progress Steps",
            "Build a Timeline Component","Create a Testimonials Slider","Build a Pricing Table","Create a Comparison Table",
            "Build a FAQ Accordion","Create a Tabs Component","Build a Dropdown Menu","Create a Context Menu",
            "Build a Notification Center","Create a User Profile Card","Build a Settings Panel","Create a Final Project Showcase"
        ];

        this.challenges = titles.map((title, i) => ({
            day: i + 1,
            title,
            description: `Day ${i + 1} Challenge: ${title}. Build this project from scratch, push to GitHub, and share your progress.`,
            time: `${20 + Math.floor(Math.random() * 40)} min`,
            xp: 100 + Math.floor(Math.random() * 200),
            difficulty: i < 20 ? 'Beginner' : i < 40 ? 'Intermediate' : 'Advanced',
            resources: [
                { title: 'MDN Documentation', url: 'https://developer.mozilla.org', icon: 'fas fa-book' },
                { title: 'Video Tutorial', url: 'https://youtube.com', icon: 'fas fa-video' }
            ]
        }));
    },

    checkSession() {
        const user = Database.getCurrentUser();
        if (user) {
            this.setUser(user);
        } else {
            this.updateUIForGuest();
        }
    },

    setUser(user) {
        this.user = user;
        this.updateUIForUser();
        this.renderLandingCalendar();
    },

    updateUIForUser() {
        document.getElementById('navSignIn').classList.add('hidden');
        const avatar = document.getElementById('navAvatar');
        avatar.classList.remove('hidden');
        avatar.innerHTML = this.user.avatar
            ? `<img src="${this.user.avatar}" alt="${this.user.name}">`
            : this.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        // Show auth-required nav items
        ['navDashboard', 'navChallenge', 'navProfile', 'navSettings'].forEach(id => {
            document.getElementById(id)?.classList.remove('hidden');
        });
        ['botDashboard', 'botChallenge', 'botProfile'].forEach(id => {
            document.getElementById(id)?.classList.remove('hidden');
        });
    },

    updateUIForGuest() {
        this.user = null;
        document.getElementById('navSignIn').classList.remove('hidden');
        document.getElementById('navAvatar').classList.add('hidden');

        ['navDashboard', 'navChallenge', 'navProfile', 'navSettings'].forEach(id => {
            document.getElementById(id)?.classList.add('hidden');
        });
        ['botDashboard', 'botChallenge', 'botProfile'].forEach(id => {
            document.getElementById(id)?.classList.add('hidden');
        });
        this.renderLandingCalendar();
    },

    navigate(page, pushState = true) {
        const authRequired = ['dashboard', 'challenge', 'profile', 'settings'];
        if (authRequired.includes(page) && !this.user) {
            this.showAuthGuard();
            return;
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(el => el.classList.remove('active'));

        // Show target page
        const target = document.getElementById(`page-${page}`);
        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0);
        }

        // Update nav active states
        document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));

        this.currentPage = page;

        if (pushState) {
            history.pushState({ page }, '', `#${page}`);
        }

        // Page-specific init
        if (page === 'dashboard') this.initDashboard();
        if (page === 'challenge') this.initChallenge();
        if (page === 'profile') Profile.init();
        if (page === 'settings') Settings.init();
    },

    handlePopState() {
        const hash = window.location.hash.replace('#', '') || 'landing';
        this.navigate(hash, false);
    },

    // Auth
    switchAuthTab(tab) {
        document.getElementById('tabSignIn').classList.toggle('active', tab === 'signin');
        document.getElementById('tabSignUp').classList.toggle('active', tab === 'signup');
        document.getElementById('formSignIn').classList.toggle('active', tab === 'signin');
        document.getElementById('formSignUp').classList.toggle('active', tab === 'signup');
        document.getElementById('authError').classList.remove('active');
    },

    showAuthError(msg) {
        const el = document.getElementById('authError');
        document.getElementById('authErrorText').textContent = msg;
        el.classList.add('active');
    },

    emailSignIn() {
        const email = document.getElementById('signinEmail').value.trim();
        const password = document.getElementById('signinPassword').value;
        if (!email || !password) {
            this.showAuthError('Please fill in all fields');
            return;
        }
        const result = Database.login(email, password);
        if (result.success) {
            this.setUser(result.user);
            this.showToast('Welcome back!', 'success');
            this.navigate('dashboard');
        } else {
            this.showAuthError(result.error);
        }
    },

    emailSignUp() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;

        if (!name || !email || !password || !confirm) {
            this.showAuthError('Please fill in all fields');
            return;
        }
        if (password.length < 8) {
            this.showAuthError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirm) {
            this.showAuthError('Passwords do not match');
            return;
        }

        const result = Database.register(name, email, password);
        if (result.success) {
            // Auto login
            const loginResult = Database.login(email, password);
            this.setUser(loginResult.user);
            this.showToast('Account created successfully!', 'success');
            this.navigate('dashboard');
        } else {
            this.showAuthError(result.error);
        }
    },

    signOut() {
        Database.logout();
        this.updateUIForGuest();
        this.showToast('Signed out successfully', 'info');
        this.navigate('landing');
    },

    // GitHub auth entry point
    initRealGithubAuth() {
        Github.openModal();
    },

    // Auth Guard
    showAuthGuard() {
        document.getElementById('authGuardOverlay').classList.add('active');
    },
    closeAuthGuard() {
        document.getElementById('authGuardOverlay').classList.remove('active');
    },
    goToAuthFromGuard() {
        this.closeAuthGuard();
        this.navigate('auth');
    },

    // User Dropdown
    toggleUserDropdown(e) {
        e.stopPropagation();
        document.getElementById('userDropdown').classList.toggle('active');
    },
    closeUserDropdown() {
        document.getElementById('userDropdown').classList.remove('active');
    },

    // Toast
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // Success Overlay
    showSuccess(xp) {
        document.getElementById('successXp').textContent = `+${xp} XP`;
        document.getElementById('successOverlay').classList.add('active');
    },
    hideSuccess() {
        document.getElementById('successOverlay').classList.remove('active');
        this.navigate('dashboard');
    },

    // Confirm Modal
    showConfirm(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        const btn = document.getElementById('confirmActionBtn');
        btn.onclick = () => {
            this.closeConfirmModal();
            onConfirm();
        };
        document.getElementById('confirmModal').classList.add('active');
    },
    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('active');
    },

    // Calendar Tooltip setup
    setupCalendarTooltip() {
        const tooltip = document.getElementById('calendarTooltip');
        document.addEventListener('mousemove', (e) => {
            if (tooltip.classList.contains('visible')) {
                const x = e.clientX;
                const y = e.clientY;
                // Keep tooltip within viewport
                const rect = tooltip.getBoundingClientRect();
                let left = x - rect.width / 2;
                let top = y - rect.height - 12;
                if (left < 10) left = 10;
                if (left + rect.width > window.innerWidth - 10) left = window.innerWidth - rect.width - 10;
                if (top < 10) top = y + 20;
                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
            }
        });
    },

    // Landing Calendar
    renderLandingCalendar() {
        const grid = document.getElementById('landingDaysGrid');
        if (!grid) return;
        grid.innerHTML = '';
        const completed = this.user ? this.user.completedDays : [];
        const current = this.user ? this.user.currentDay : 1;

        for (let i = 1; i <= 60; i++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            cell.textContent = i;

            // Calculate actual date
            const startDate = this.user ? new Date(this.user.startDate) : new Date();
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + (i - 1));
            cell.dataset.date = cellDate.toISOString();
            cell.dataset.day = i;

            if (completed.includes(i)) cell.classList.add('completed');
            else if (i === current) cell.classList.add('current');
            else if (i < current) cell.classList.add('missed');

            // Tooltip events
            cell.addEventListener('mouseenter', () => Calendar.showTooltip(cell));
            cell.addEventListener('mouseleave', () => Calendar.hideTooltip());
            cell.addEventListener('click', () => Calendar.showTooltip(cell, true));

            grid.appendChild(cell);
        }
    },

    // Dashboard
    initDashboard() {
        if (!this.user) return;
        const user = Database.getFullUser();
        if (!user) return;

        const pct = Math.round((user.completedDays.length / 60) * 100);
        document.getElementById('dashProgressValue').textContent = pct + '%';
        document.getElementById('dashProgressRing').style.strokeDashoffset = 440 - (440 * pct / 100);
        document.getElementById('dashDayText').textContent = `Day ${user.currentDay} of 60`;
        document.getElementById('dashStreakText').textContent = `${user.streak} day streak`;
        document.getElementById('dashXP').textContent = user.xp.toLocaleString();
        document.getElementById('dashStreak').textContent = user.streak;
        document.getElementById('dashCompleted').textContent = user.completedDays.length;
        document.getElementById('dashBadges').textContent = user.badges.length;

        // Dashboard calendar
        const dGrid = document.getElementById('dashboardDaysGrid');
        if (dGrid) {
            dGrid.innerHTML = '';
            for (let i = 1; i <= 60; i++) {
                const cell = document.createElement('div');
                cell.className = 'day-cell';
                cell.textContent = i;
                const startDate = new Date(user.startDate);
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + (i - 1));
                cell.dataset.date = cellDate.toISOString();
                cell.dataset.day = i;

                if (user.completedDays.includes(i)) cell.classList.add('completed');
                else if (i === user.currentDay) cell.classList.add('current');
                else if (i < user.currentDay) cell.classList.add('missed');

                cell.addEventListener('mouseenter', () => Calendar.showTooltip(cell));
                cell.addEventListener('mouseleave', () => Calendar.hideTooltip());
                cell.addEventListener('click', () => Calendar.showTooltip(cell, true));
                dGrid.appendChild(cell);
            }
        }

        // Leaderboard
        const lb = document.getElementById('dashLeaderboard');
        if (lb) {
            const board = Database.getLeaderboard();
            lb.innerHTML = board.slice(0, 5).map(entry => `
                <div class="leaderboard-item ${entry.isCurrentUser ? 'current-user' : ''}">
                    <div class="rank ${entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? 'bronze' : 'other'}">${entry.rank}</div>
                    <div style="flex:1;">
                        <div style="font-weight:600;">${entry.name} ${entry.isCurrentUser ? '<span style="color:var(--accent-primary);font-size:0.75rem;">(You)</span>' : ''}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">${entry.xp.toLocaleString()} XP</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:700;font-size:0.9rem;">${entry.streak}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted);">streak</div>
                    </div>
                </div>
            `).join('');
        }
    },

    // Challenge
    initChallenge() {
        if (!this.user) return;
        const user = Database.getFullUser();
        if (!user) return;
        const day = user.currentDay;
        const challenge = this.challenges[day - 1] || this.challenges[0];

        document.getElementById('challengeDayNum').textContent = day;
        document.getElementById('challengeTitle').textContent = challenge.title;
        document.getElementById('challengeDesc').textContent = challenge.description;
        document.getElementById('challengeTime').textContent = challenge.time;
        document.getElementById('challengeXP').textContent = challenge.xp + ' XP';
        document.getElementById('challengeDiff').textContent = challenge.difficulty;
        document.getElementById('submitDayNum').textContent = day;

        const resList = document.getElementById('challengeResources');
        resList.innerHTML = challenge.resources.map(r => `
            <a href="${r.url}" class="resource-item" target="_blank">
                <div class="resource-icon"><i class="${r.icon}"></i></div>
                <div><div style="font-weight:600;font-size:0.9rem;">${r.title}</div><div style="font-size:0.8rem;color:var(--text-muted);">${r.url.replace('https://', '')}</div></div>
            </a>
        `).join('');

        // Reset submission state
        document.getElementById('submissionArea').classList.remove('submitted');
        document.getElementById('aiFeedback').classList.add('hidden');
        document.getElementById('githubSubmission').value = '';
    },

    submitChallenge() {
        const url = document.getElementById('githubSubmission').value.trim();
        if (!url) {
            this.showToast('Please enter a GitHub repository URL', 'error');
            return;
        }
        if (!url.includes('github.com')) {
            this.showToast('Please enter a valid GitHub URL', 'error');
            return;
        }

        const user = Database.getFullUser();
        const day = user.currentDay;
        const challenge = this.challenges[day - 1];

        const result = Database.addContribution({
            day,
            title: challenge.title,
            description: challenge.description,
            githubUrl: url,
            xp: challenge.xp
        });

        if (result.success) {
            document.getElementById('submissionArea').classList.add('submitted');
            document.getElementById('aiFeedback').classList.remove('hidden');
            this.showSuccess(challenge.xp);
            this.user = Database.getCurrentUser();
        }
    },

    toggleChecklist(el) {
        el.classList.toggle('completed');
    },

    setupNavScroll() {
        const nav = document.getElementById('topNav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => app.init());

/**
 * ABTalks Profile Module
 * Handles profile display, avatar upload, and section switching
 */

const Profile = {
    tempAvatar: null,

    init() {
        const user = Database.getFullUser();
        if (!user) return;

        // Basic info
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileHandle').textContent = `@${user.email.split('@')[0]}`;
        document.getElementById('profileBio').textContent = user.bio || 'No bio yet. Edit your profile to add one.';
        document.getElementById('profileLocation').textContent = user.location || 'Not set';
        document.getElementById('profileWebsite').textContent = user.website || 'Not set';
        document.getElementById('profileJoined').textContent = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        // Avatar
        const avatarLarge = document.getElementById('profileAvatarLarge');
        if (user.avatar) {
            avatarLarge.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
        } else {
            avatarLarge.textContent = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }

        // Stats
        document.getElementById('profileXP').textContent = user.xp.toLocaleString();
        document.getElementById('profileStreak').textContent = user.streak;
        document.getElementById('profileCompleted').textContent = user.completedDays.length;

        // Badges inline
        const badgeContainer = document.getElementById('profileBadges');
        const badgeMap = {
            starter: { icon: 'fa-rocket', name: 'Starter' },
            week_streak: { icon: 'fa-fire', name: '7-Day Streak' },
            month_streak: { icon: 'fa-fire-alt', name: '30-Day Streak' },
            xp_1k: { icon: 'fa-bolt', name: '1K XP' },
            xp_5k: { icon: 'fa-bolt', name: '5K XP' },
            halfway: { icon: 'fa-flag-checkered', name: 'Halfway' },
            completionist: { icon: 'fa-trophy', name: 'Completionist' }
        };
        badgeContainer.innerHTML = user.badges.map(b => {
            const info = badgeMap[b] || { icon: 'fa-medal', name: b };
            return `<div class="profile-badge-inline"><i class="fas ${info.icon}"></i> ${info.name}</div>`;
        }).join('');

        // Contributions
        this.renderContributions();

        // Achievements grid
        this.renderAchievements();

        // GitHub status
        if (user.githubUsername) {
            Github.updateUI(user.githubData);
        } else {
            Github.clearUI();
        }
    },

    renderContributions() {
        const user = Database.getFullUser();
        const contribs = Database.getUserContributions();
        const container = document.getElementById('profileContributionsList');

        if (contribs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-code-branch"></i></div>
                    <h3>No contributions yet</h3>
                    <p>Complete your first daily challenge to see it here.</p>
                </div>`;
            return;
        }

        container.innerHTML = contribs.slice().reverse().map(c => `
            <div class="glass-card" style="padding:20px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                    <div>
                        <div style="font-weight:700;">Day ${c.day}: ${c.title}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">${new Date(c.completedAt).toLocaleDateString()}</div>
                    </div>
                    <div style="background:var(--accent-gradient);padding:4px 12px;border-radius:100px;font-size:0.8rem;font-weight:700;">+${c.xpEarned} XP</div>
                </div>
                ${c.githubUrl ? `<a href="${c.githubUrl}" target="_blank" style="color:var(--github);font-size:0.85rem;text-decoration:none;"><i class="fab fa-github"></i> ${c.githubUrl}</a>` : ''}
            </div>
        `).join('');
    },

    renderAchievements() {
        const user = Database.getFullUser();
        const badgeMap = {
            starter: { icon: 'fa-rocket', name: 'Starter', desc: 'Joined the challenge' },
            week_streak: { icon: 'fa-fire', name: '7-Day Streak', desc: '7 days in a row' },
            month_streak: { icon: 'fa-fire-alt', name: '30-Day Streak', desc: '30 days in a row' },
            xp_1k: { icon: 'fa-bolt', name: '1K XP', desc: 'Earned 1,000 XP' },
            xp_5k: { icon: 'fa-bolt', name: '5K XP', desc: 'Earned 5,000 XP' },
            halfway: { icon: 'fa-flag-checkered', name: 'Halfway', desc: 'Completed 30 days' },
            completionist: { icon: 'fa-trophy', name: 'Completionist', desc: 'Completed all 60 days' }
        };

        const allBadges = Object.keys(badgeMap);
        const container = document.getElementById('profileBadgeGrid');
        container.innerHTML = allBadges.map(b => {
            const info = badgeMap[b];
            const unlocked = user.badges.includes(b);
            return `
                <div class="badge-item ${unlocked ? '' : 'locked'}">
                    <div class="badge-icon"><i class="fas ${info.icon}"></i></div>
                    <div class="badge-name">${info.name}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-align:center;">${info.desc}</div>
                </div>
            `;
        }).join('');
    },

    switchSection(section) {
        document.querySelectorAll('.profile-menu-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.profile-section').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
        document.getElementById(`profile-section-${section}`)?.classList.add('active');
    },

    // Avatar Upload
    openAvatarModal() {
        this.tempAvatar = null;
        document.getElementById('avatarModal').classList.add('active');
        document.getElementById('avatarPreview').classList.add('hidden');
        document.getElementById('avatarUploadPrompt').classList.remove('hidden');
        document.getElementById('avatarSaveBtn').disabled = true;
        document.getElementById('avatarFileInput').value = '';
    },

    closeAvatarModal() {
        document.getElementById('avatarModal').classList.remove('active');
        this.tempAvatar = null;
    },

    handleAvatarSelect(input) {
        const file = input.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            app.showToast('Please select an image file', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            app.showToast('Image must be under 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.tempAvatar = e.target.result;
            const preview = document.getElementById('avatarPreview');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            document.getElementById('avatarUploadPrompt').classList.add('hidden');
            document.getElementById('avatarSaveBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    },

    saveAvatar() {
        if (!this.tempAvatar) return;
        const result = Database.updateAvatar(this.tempAvatar);
        if (result.success) {
            app.user = result.user;
            app.updateUIForUser();
            this.init();
            Settings.loadProfileData();
            app.showToast('Avatar updated successfully!', 'success');
            this.closeAvatarModal();
        }
    }
};

// Drag and drop for avatar
const dropZone = document.getElementById('avatarDropZone');
if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            const input = document.getElementById('avatarFileInput');
            const dT = new DataTransfer();
            dT.items.add(files[0]);
            input.files = dT.files;
            Profile.handleAvatarSelect(input);
        }
    }, false);
}

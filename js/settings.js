/**
 * ABTalks Settings Module
 * Fully functional settings for profile, account, notifications, GitHub, data, and danger zone
 */

const Settings = {
    init() {
        this.loadProfileData();
        this.loadAccountData();
        this.loadNotificationSettings();
        this.loadGithubData();
    },

    switchPanel(panel) {
        document.querySelectorAll('.settings-nav-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-panel="${panel}"]`)?.classList.add('active');
        document.getElementById(`settings-panel-${panel}`)?.classList.add('active');
    },

    // Profile Settings
    loadProfileData() {
        const user = Database.getFullUser();
        if (!user) return;

        document.getElementById('settingsName').value = user.name || '';
        document.getElementById('settingsBio').value = user.bio || '';
        document.getElementById('settingsLocation').value = user.location || '';
        document.getElementById('settingsWebsite').value = user.website || '';

        const avatar = document.getElementById('settingsAvatar');
        if (user.avatar) {
            avatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            avatar.textContent = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
    },

    saveProfile() {
        const updates = {
            name: document.getElementById('settingsName').value.trim(),
            bio: document.getElementById('settingsBio').value.trim(),
            location: document.getElementById('settingsLocation').value.trim(),
            website: document.getElementById('settingsWebsite').value.trim()
        };

        const result = Database.updateUser(updates);
        if (result.success) {
            app.user = result.user;
            app.updateUIForUser();
            app.showToast('Profile updated successfully!', 'success');
        } else {
            app.showToast(result.error || 'Failed to update profile', 'error');
        }
    },

    // Account Settings
    loadAccountData() {
        const user = Database.getFullUser();
        if (!user) return;
        document.getElementById('settingsEmail').value = user.email;
    },

    changePassword() {
        const current = document.getElementById('settingsCurrentPassword').value;
        const newPass = document.getElementById('settingsNewPassword').value;
        const confirm = document.getElementById('settingsConfirmPassword').value;

        if (!current || !newPass || !confirm) {
            app.showToast('Please fill in all password fields', 'error');
            return;
        }
        if (newPass.length < 8) {
            app.showToast('New password must be at least 8 characters', 'error');
            return;
        }
        if (newPass !== confirm) {
            app.showToast('New passwords do not match', 'error');
            return;
        }

        const result = Database.updatePassword(current, newPass);
        if (result.success) {
            app.showToast('Password updated successfully!', 'success');
            document.getElementById('settingsCurrentPassword').value = '';
            document.getElementById('settingsNewPassword').value = '';
            document.getElementById('settingsConfirmPassword').value = '';
        } else {
            app.showToast(result.error || 'Failed to update password', 'error');
        }
    },

    // Notifications
    loadNotificationSettings() {
        const user = Database.getFullUser();
        if (!user || !user.settings) return;

        document.getElementById('notifReminders').checked = user.settings.notifications !== false;
        document.getElementById('notifEmail').checked = user.settings.emailUpdates !== false;
        document.getElementById('notifLeaderboard').checked = user.settings.leaderboardAlerts === true;
        document.getElementById('reminderTime').value = user.settings.reminderTime || '09:00';
    },

    toggleSetting(key, value) {
        const updates = { [key]: value };
        Database.updateSettings(updates);
        app.showToast('Setting saved', 'success');
    },

    updateReminderTime(value) {
        Database.updateSettings({ reminderTime: value });
        app.showToast('Reminder time updated', 'success');
    },

    // GitHub
    loadGithubData() {
        const user = Database.getFullUser();
        if (!user) return;

        const connectGroup = document.getElementById('githubConnectGroup');
        const connectedGroup = document.getElementById('githubConnectedGroup');

        if (user.githubUsername && user.githubData) {
            connectGroup.classList.add('hidden');
            connectedGroup.classList.remove('hidden');

            document.getElementById('settingsGithubName').textContent = `@${user.githubData.login}`;
            document.getElementById('ghRepoCount').textContent = user.githubData.public_repos || 0;
            document.getElementById('ghFollowers').textContent = user.githubData.followers || 0;
            document.getElementById('ghFollowing').textContent = user.githubData.following || 0;

            const repoList = document.getElementById('githubRepoList');
            if (user.githubData.repos && user.githubData.repos.length) {
                repoList.innerHTML = user.githubData.repos.map(r => `
                    <div class="github-repo-item">
                        <div>
                            <div class="github-repo-name"><i class="fab fa-github" style="margin-right:8px;color:var(--github)"></i>${r.name}</div>
                            <div class="github-repo-meta">${r.language || 'No language'} • ⭐ ${r.stargazers_count || 0}</div>
                        </div>
                        <a href="${r.html_url}" target="_blank" class="btn btn-ghost btn-sm"><i class="fas fa-external-link-alt"></i></a>
                    </div>
                `).join('');
            } else {
                repoList.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">No public repositories found.</p>';
            }
        } else {
            connectGroup.classList.remove('hidden');
            connectedGroup.classList.add('hidden');
        }
    },

    // Data Management
    exportData() {
        const data = Database.exportData();
        if (!data) {
            app.showToast('Failed to export data', 'error');
            return;
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abtalks-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        app.showToast('Data exported successfully!', 'success');
    },

    importData(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = Database.importData(e.target.result);
                if (result.success) {
                    app.showToast('Data imported successfully! Please refresh.', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    app.showToast(result.error || 'Invalid backup file', 'error');
                }
            } catch (err) {
                app.showToast('Failed to import: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        input.value = '';
    },

    // Danger Zone
    confirmReset() {
        app.showConfirm(
            'Reset All Progress',
            'This will permanently delete all your challenge progress, XP, streaks, and contributions. This action cannot be undone.',
            () => {
                const result = Database.resetProgress();
                if (result.success) {
                    app.user = Database.getCurrentUser();
                    app.showToast('All progress has been reset', 'warning');
                    app.navigate('dashboard');
                }
            }
        );
    },

    confirmDelete() {
        app.showConfirm(
            'Delete Account',
            'This will permanently delete your account and all data. This action cannot be undone. Please enter your password to confirm.',
            () => {
                // Prompt for password
                const password = prompt('Enter your password to confirm account deletion:');
                if (!password) return;
                const result = Database.deleteAccount(password);
                if (result.success) {
                    app.showToast('Account deleted successfully', 'info');
                    app.updateUIForGuest();
                    app.navigate('landing');
                } else {
                    app.showToast(result.error || 'Failed to delete account', 'error');
                }
            }
        );
    }
};

/**
 * ABTalks GitHub Integration Module
 * Connects to real GitHub accounts using Personal Access Tokens
 */

const Github = {
    apiBase: 'https://api.github.com',
    currentUser: null,

    openModal() {
        document.getElementById('githubModal').classList.add('active');
        document.getElementById('githubModalError').classList.remove('active');
    },

    closeModal() {
        document.getElementById('githubModal').classList.remove('active');
    },

    openConnectModal() {
        this.openModal();
    },

    async connect() {
        const token = document.getElementById('githubModalPAT').value.trim();
        const username = document.getElementById('githubModalUsername').value.trim();
        const btn = document.getElementById('githubModalBtn');
        const errorEl = document.getElementById('githubModalError');
        const errorText = document.getElementById('githubModalErrorText');

        if (!token) {
            errorText.textContent = 'Please enter a Personal Access Token';
            errorEl.classList.add('active');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

        try {
            // Validate token by fetching user profile
            const headers = {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            };

            const response = await fetch(`${this.apiBase}/user`, { headers });
            if (!response.ok) {
                if (response.status === 401) throw new Error('Invalid token. Please check and try again.');
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            const githubUsername = username || data.login;

            // Fetch repos
            const reposRes = await fetch(`${this.apiBase}/users/${githubUsername}/repos?sort=updated&per_page=5`, { headers });
            const repos = reposRes.ok ? await reposRes.json() : [];

            const githubData = {
                login: data.login,
                name: data.name,
                avatar_url: data.avatar_url,
                html_url: data.html_url,
                public_repos: data.public_repos,
                followers: data.followers,
                following: data.following,
                bio: data.bio,
                repos: repos.map(r => ({
                    name: r.name,
                    html_url: r.html_url,
                    description: r.description,
                    stargazers_count: r.stargazers_count,
                    language: r.language,
                    updated_at: r.updated_at
                }))
            };

            // Save to database
            Database.connectGithub(token, githubUsername, githubData);

            // Update UI
            this.updateUI(githubData);
            app.showToast(`Connected to GitHub as @${githubUsername}!`, 'success');
            this.closeModal();

            // Refresh settings if open
            if (document.getElementById('page-settings').classList.contains('active')) {
                Settings.loadGithubData();
            }

        } catch (err) {
            errorText.textContent = err.message;
            errorEl.classList.add('active');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-plug"></i> Connect';
        }
    },

    async connectFromSettings() {
        const token = document.getElementById('githubPAT').value.trim();
        if (!token) {
            app.showToast('Please enter your GitHub PAT', 'error');
            return;
        }

        const btn = event.target;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

        try {
            const headers = {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            };

            const response = await fetch(`${this.apiBase}/user`, { headers });
            if (!response.ok) throw new Error('Invalid token');

            const data = await response.json();

            const reposRes = await fetch(`${this.apiBase}/users/${data.login}/repos?sort=updated&per_page=5`, { headers });
            const repos = reposRes.ok ? await reposRes.json() : [];

            const githubData = {
                login: data.login,
                name: data.name,
                avatar_url: data.avatar_url,
                html_url: data.html_url,
                public_repos: data.public_repos,
                followers: data.followers,
                following: data.following,
                bio: data.bio,
                repos: repos.map(r => ({
                    name: r.name,
                    html_url: r.html_url,
                    description: r.description,
                    stargazers_count: r.stargazers_count,
                    language: r.language,
                    updated_at: r.updated_at
                }))
            };

            Database.connectGithub(token, data.login, githubData);
            this.updateUI(githubData);
            Settings.loadGithubData();
            app.showToast(`Connected as @${data.login}!`, 'success');

        } catch (err) {
            app.showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-plug"></i> Connect GitHub Account';
        }
    },

    disconnect() {
        Database.disconnectGithub();
        this.clearUI();
        Settings.loadGithubData();
        app.showToast('GitHub account disconnected', 'info');
    },

    updateUI(data) {
        // Profile page
        const status = document.getElementById('githubStatus');
        const btn = document.getElementById('githubConnectBtn');
        if (status) {
            status.innerHTML = `<span class="status-dot"></span> Connected as @${data.login}`;
            status.classList.add('connected');
        }
        if (btn) {
            btn.innerHTML = '<i class="fas fa-unlink"></i> Disconnect';
            btn.onclick = () => this.disconnect();
            btn.className = 'btn btn-danger btn-sm';
        }
    },

    clearUI() {
        const status = document.getElementById('githubStatus');
        const btn = document.getElementById('githubConnectBtn');
        if (status) {
            status.innerHTML = '<span class="status-dot"></span> Not connected';
            status.classList.remove('connected');
        }
        if (btn) {
            btn.innerHTML = '<i class="fas fa-plug"></i> Connect';
            btn.onclick = () => this.openConnectModal();
            btn.className = 'btn btn-github btn-sm';
        }
    },

    async fetchRepos() {
        const user = Database.getFullUser();
        if (!user || !user.githubToken) return;

        const btn = event ? event.target : null;
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        }

        try {
            const headers = {
                'Authorization': `token ${user.githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            };

            const dataRes = await fetch(`${this.apiBase}/users/${user.githubUsername}`, { headers });
            const data = await dataRes.json();

            const reposRes = await fetch(`${this.apiBase}/users/${user.githubUsername}/repos?sort=updated&per_page=5`, { headers });
            const repos = reposRes.ok ? await reposRes.json() : [];

            const githubData = {
                login: data.login,
                name: data.name,
                avatar_url: data.avatar_url,
                html_url: data.html_url,
                public_repos: data.public_repos,
                followers: data.followers,
                following: data.following,
                bio: data.bio,
                repos: repos.map(r => ({
                    name: r.name,
                    html_url: r.html_url,
                    description: r.description,
                    stargazers_count: r.stargazers_count,
                    language: r.language,
                    updated_at: r.updated_at
                }))
            };

            Database.updateUser({ githubData });
            Settings.loadGithubData();
            app.showToast('GitHub data refreshed!', 'success');

        } catch (err) {
            app.showToast('Failed to refresh: ' + err.message, 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
            }
        }
    }
};

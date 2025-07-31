// GitHub OAuth Authentication (Most Secure Option)
const GitHubAuth = {
    clientId: 'your-github-app-client-id', // Set this in GitHub Apps
    
    // Initiate GitHub OAuth flow
    loginWithGitHub() {
        const scope = 'user:email';
        const redirectUri = encodeURIComponent(window.location.origin);
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
        
        window.location.href = githubAuthUrl;
    },

    // Handle OAuth callback
    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            try {
                // Exchange code for access token (requires backend or serverless function)
                const response = await fetch('/.netlify/functions/github-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                
                const data = await response.json();
                
                if (data.user) {
                    // Check if user is authorized (you can whitelist GitHub usernames)
                    const authorizedUsers = ['your-github-username']; // Add your GitHub username
                    
                    if (authorizedUsers.includes(data.user.login)) {
                        DataManager.isAuthenticated = true;
                        DataManager.authToken = data.access_token;
                        
                        localStorage.setItem('github_auth', JSON.stringify({
                            user: data.user,
                            token: data.access_token,
                            timestamp: Date.now()
                        }));
                        
                        return true;
                    }
                }
            } catch (error) {
                console.error('GitHub auth error:', error);
            }
        }
        return false;
    },

    // Check existing GitHub authentication
    checkExistingAuth() {
        const savedAuth = localStorage.getItem('github_auth');
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            // Check if auth is still valid (7 days)
            if (Date.now() - authData.timestamp < 7 * 24 * 60 * 60 * 1000) {
                DataManager.isAuthenticated = true;
                DataManager.authToken = authData.token;
                return true;
            } else {
                localStorage.removeItem('github_auth');
            }
        }
        return false;
    }
};

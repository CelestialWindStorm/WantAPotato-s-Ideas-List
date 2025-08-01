// Project Data Manager with Authentication
class DataManager {
    constructor() {
        this.isAuthenticated = false;
        this.authModal = null;
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.init();
    }

    init() {
        this.createAuthModal();
        this.checkAuthenticationStatus();
        this.setupEventListeners();
    }

    createAuthModal() {
        // Create modal HTML if it doesn't exist
        if (!document.getElementById('auth-modal')) {
            const modalHtml = `
                <div id="auth-modal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>🔐 Authentication Required</h2>
                            <span class="close" id="auth-modal-close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <p>Please enter the password to access project management features:</p>
                            <form id="auth-form">
                                <div class="form-group">
                                    <label for="auth-password">Password:</label>
                                    <input type="password" id="auth-password" required placeholder="Enter password">
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">Login</button>
                                    <button type="button" class="btn btn-secondary" id="auth-cancel">Cancel</button>
                                </div>
                            </form>
                            <div id="auth-error" class="error-message" style="display: none;"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
        
        this.authModal = document.getElementById('auth-modal');
    }

    setupEventListeners() {
        // Auth form submission
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuthentication();
            });
        }

        // Modal close buttons
        const closeBtn = document.getElementById('auth-modal-close');
        const cancelBtn = document.getElementById('auth-cancel');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideAuthModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideAuthModal());
        }

        // Close modal on background click
        if (this.authModal) {
            this.authModal.addEventListener('click', (e) => {
                if (e.target === this.authModal) {
                    this.hideAuthModal();
                }
            });
        }
    }

    async handleAuthentication() {
        const passwordInput = document.getElementById('auth-password');
        const password = passwordInput.value;
        
        if (await this.validatePassword(password)) {
            this.isAuthenticated = true;
            this.storeAuthenticationState();
            this.hideAuthModal();
            this.showAuthenticationInfo();
            this.showNotification('✅ Successfully authenticated!', 'success');
            passwordInput.value = '';
        } else {
            this.showAuthError('Invalid password. Please try again.');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    async validatePassword(enteredPassword) {
        // Default password
        let correctPassword = 'admin123';
        
        try {
            // Try to fetch from config file first
            const configResponse = await fetch('./config.js');
            if (configResponse.ok) {
                const configContent = await configResponse.text();
                const passwordMatch = configContent.match(/const\s+WEBSITE_PASSWORD\s*=\s*['"]([^'"]+)['"]/);
                if (passwordMatch) {
                    correctPassword = passwordMatch[1];
                }
            }
        } catch (error) {
            // Fall back to localStorage or environment variable if available
            const storedPassword = localStorage.getItem('websitePassword') || 
                                 this.getPasswordFromPlaceholder();
            if (storedPassword) {
                correctPassword = storedPassword;
            }
        }
        
        return enteredPassword === correctPassword;
    }

    getPasswordFromPlaceholder() {
        // Look for PASSWORD_PLACEHOLDER in any script tags or config
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            if (script.textContent && script.textContent.includes('PASSWORD_PLACEHOLDER')) {
                const match = script.textContent.match(/PASSWORD_PLACEHOLDER.*?['"]([^'"]+)['"]/);
                if (match) {
                    return match[1];
                }
            }
        }
        return null;
    }

    checkAuthenticationStatus() {
        const authData = localStorage.getItem('projectAuth');
        if (authData) {
            try {
                const data = JSON.parse(authData);
                const now = Date.now();
                
                if (data.authenticated && data.timestamp && (now - data.timestamp) < this.sessionTimeout) {
                    this.isAuthenticated = true;
                    this.showAuthenticationInfo();
                    return;
                }
            } catch (error) {
                console.error('Error parsing auth data:', error);
            }
        }
        
        this.isAuthenticated = false;
        this.hideAuthenticationInfo();
    }

    storeAuthenticationState() {
        const authData = {
            authenticated: true,
            timestamp: Date.now()
        };
        localStorage.setItem('projectAuth', JSON.stringify(authData));
    }

    showAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'block';
            const passwordInput = document.getElementById('auth-password');
            if (passwordInput) {
                passwordInput.focus();
            }
        }
    }

    hideAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'none';
        }
        this.hideAuthError();
    }

    showAuthError(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    hideAuthError() {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    showAuthenticationInfo() {
        // Create or show authentication info panel
        let authInfo = document.getElementById('auth-info');
        if (!authInfo) {
            const authInfoHtml = `
                <div id="auth-info" class="auth-info" style="background: #f0fff4; border: 1px solid #38a169; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 0.5rem 0; color: #22543d;">🔓 Authenticated Session</h4>
                        <p style="margin: 0; color: #22543d; font-size: 0.9rem;">You are logged in to the project management system. Your session will expire in 24 hours.</p>
                    </div>
                    <button id="logout-btn" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">Logout</button>
                </div>
            `;
            
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.insertAdjacentHTML('afterbegin', authInfoHtml);
                
                // Add logout functionality
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        if (confirm('Are you sure you want to logout?')) {
                            this.logout();
                        }
                    });
                }
            }
        } else {
            authInfo.style.display = 'flex';
        }
    }

    hideAuthenticationInfo() {
        const authInfo = document.getElementById('auth-info');
        if (authInfo) {
            authInfo.style.display = 'none';
        }
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('projectAuth');
        this.hideAuthenticationInfo();
        this.showNotification('👋 Logged out successfully', 'info');
    }

    requireAuth() {
        if (!this.isAuthenticated) {
            this.showAuthModal();
            return false;
        }
        return true;
    }

    // Project data management functions
    async loadProjectFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    exportProject(categoryId, projectId, projectData) {
        if (!this.requireAuth()) return;

        const exportData = {
            metadata: {
                title: projectData.title,
                categoryId: categoryId,
                projectId: projectId,
                exported: new Date().toISOString(),
                created: projectData.created,
                lastModified: projectData.lastModified
            },
            content: projectData.content
        };

        this.downloadJSON(exportData, `${projectData.title || 'project'}.json`);
        this.showNotification('📥 Project exported successfully!', 'success');
    }

    downloadProject(categoryId, projectId, projectData) {
        return this.exportProject(categoryId, projectId, projectData);
    }

    downloadJSON(data, filename) {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    backup() {
        if (!this.requireAuth()) return;

        const allProjects = {};
        
        // Get all projects from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('project_')) {
                const value = localStorage.getItem(key);
                try {
                    allProjects[key] = JSON.parse(value);
                } catch (error) {
                    console.error('Error parsing project data:', error);
                }
            }
        }

        const backupData = {
            metadata: {
                type: 'full-backup',
                created: new Date().toISOString(),
                version: '1.0',
                projectCount: Object.keys(allProjects).length
            },
            projects: allProjects
        };

        this.downloadJSON(backupData, `projects_backup_${new Date().toISOString().split('T')[0]}.json`);
        this.showNotification('💾 Backup created successfully!', 'success');
    }

    async restore(file) {
        if (!this.requireAuth()) return;

        try {
            const backupData = await this.loadProjectFromFile(file);
            
            if (backupData.projects) {
                let count = 0;
                for (const [key, value] of Object.entries(backupData.projects)) {
                    localStorage.setItem(key, JSON.stringify(value));
                    count++;
                }
                
                this.showNotification(`🔄 Restored ${count} projects from backup!`, 'success');
                setTimeout(() => location.reload(), 2000);
            } else {
                throw new Error('Invalid backup file format');
            }
        } catch (error) {
            this.showNotification('❌ Error restoring backup: ' + error.message, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#38a169',
            error: '#e53e3e',
            info: '#3182ce'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize DataManager
const dataManager = new DataManager();

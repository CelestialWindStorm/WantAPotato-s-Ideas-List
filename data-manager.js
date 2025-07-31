// Data persistence utility for GitHub Pages deployment
// This script provides functionality to save and load project data from browser storage

const DataManager = {
    // Authentication settings
    isAuthenticated: false,
    authToken: null,
    
    // Initialize authentication
    async initializeAuth() {
        // Check if user is already authenticated
        const savedAuth = localStorage.getItem('project_auth');
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            // Check if auth is still valid (24 hours)
            if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
                this.isAuthenticated = true;
                this.authToken = authData.token;
                return true;
            } else {
                localStorage.removeItem('project_auth');
            }
        }
        return false;
    },

    // Simple authentication (you can enhance this later)
    authenticate(password) {
        // You can change this password to whatever you want
        const correctPassword = "WantAPotato2025!"; // Change this to your desired password
        
        if (password === correctPassword) {
            this.isAuthenticated = true;
            this.authToken = btoa(Date.now().toString());
            
            // Save authentication for 24 hours
            localStorage.setItem('project_auth', JSON.stringify({
                token: this.authToken,
                timestamp: Date.now()
            }));
            
            return true;
        }
        return false;
    },

    // Logout
    logout() {
        this.isAuthenticated = false;
        this.authToken = null;
        localStorage.removeItem('project_auth');
        location.reload();
    },

    // Check if user is authenticated for any action
    requireAuth() {
        if (!this.isAuthenticated) {
            this.showAuthModal();
            return false;
        }
        return true;
    },

    // Show authentication modal
    showAuthModal() {
        let modal = document.getElementById('authModal');
        if (!modal) {
            modal = this.createAuthModal();
        }
        modal.style.display = 'block';
    },

    // Create authentication modal
    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🔐 Authentication Required</h3>
                <p>Please enter the password to access the project management system:</p>
                <form id="authForm">
                    <input type="password" id="authPassword" placeholder="Enter password" required style="width: 100%; padding: 0.8rem; margin: 1rem 0; border: 1px solid #e2e8f0; border-radius: 6px;">
                    <div style="text-align: right;">
                        <button type="submit" class="btn btn-primary">Login</button>
                    </div>
                </form>
                <div id="authError" style="color: #e53e3e; margin-top: 0.5rem; display: none;"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('#authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const password = modal.querySelector('#authPassword').value;
            const errorDiv = modal.querySelector('#authError');
            
            if (this.authenticate(password)) {
                modal.style.display = 'none';
                this.showNotification('✅ Successfully authenticated!', 'success');
                location.reload(); // Refresh to show content
            } else {
                errorDiv.textContent = 'Incorrect password. Please try again.';
                errorDiv.style.display = 'block';
                modal.querySelector('#authPassword').value = '';
            }
        });

        return modal;
    },

    // Convert project data to JSON format for export
    exportProject: function(categoryId, projectId, projectData) {
        const exportData = {
            metadata: {
                categoryId: categoryId,
                projectId: projectId,
                title: projectData.title,
                created: projectData.created || new Date().toISOString(),
                lastModified: projectData.lastModified,
                version: '1.0'
            },
            content: projectData.content
        };
        
        return JSON.stringify(exportData, null, 2);
    },

    // Download project as JSON file (fallback method)
    downloadProject: function(categoryId, projectId, projectData) {
        if (!this.requireAuth()) return;
        
        const jsonData = this.exportProject(categoryId, projectId, projectData);
        const fileName = `${categoryId}_${projectId}.json`;
        
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`💾 ${fileName} downloaded!`, 'success');
    },

    // Load project from JSON file
    loadProjectFromFile: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const projectData = JSON.parse(e.target.result);
                    resolve(projectData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    // Show notification to user
    showNotification: function(message, type = 'info') {
        let indicator = document.getElementById('saveIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'saveIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 8px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
            `;
            document.body.appendChild(indicator);
        }
        
        // Set colors based on type
        const colors = {
            success: { bg: '#38a169', color: 'white' },
            warning: { bg: '#d69e2e', color: 'white' },
            error: { bg: '#e53e3e', color: 'white' },
            info: { bg: '#3182ce', color: 'white' }
        };
        
        const style = colors[type] || colors.info;
        indicator.style.background = style.bg;
        indicator.style.color = style.color;
        indicator.textContent = message;
        indicator.style.opacity = '1';
        
        // Hide after 4 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 4000);
    },

    // Load project from JSON file
    loadProjectFromFile: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const projectData = JSON.parse(e.target.result);
                    resolve(projectData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    // Load all projects from the connected folder
    async loadAllProjectsFromFolder() {
        if (!this.projectPagesHandle) {
            this.showNotification('❌ No folder connected. Please connect the project pages folder first.', 'error');
            return;
        }

        try {
            let loadedCount = 0;
            let errorCount = 0;

            for await (const [name, handle] of this.projectPagesHandle.entries()) {
                if (handle.kind === 'file' && name.endsWith('.json') && name.includes('_')) {
                    try {
                        const file = await handle.getFile();
                        const projectData = await this.loadProjectFromFile(file);
                        
                        if (projectData.metadata) {
                            // Save to localStorage
                            const storageData = {
                                title: projectData.metadata.title,
                                content: projectData.content,
                                created: projectData.metadata.created,
                                lastModified: projectData.metadata.lastModified
                            };
                            
                            Storage.saveProject(
                                projectData.metadata.categoryId, 
                                projectData.metadata.projectId, 
                                storageData
                            );
                            loadedCount++;
                        }
                    } catch (error) {
                        console.error(`Error loading ${name}:`, error);
                        errorCount++;
                    }
                }
            }

            if (loadedCount > 0) {
                this.showNotification(`✅ Loaded ${loadedCount} projects from folder!${errorCount > 0 ? ` (${errorCount} errors)` : ''}`, 'success');
                // Refresh the page to show loaded projects
                setTimeout(() => location.reload(), 1500);
            } else {
                this.showNotification('ℹ️ No valid project files found in the folder.', 'info');
            }

        } catch (error) {
            console.error('Error loading projects from folder:', error);
            this.showNotification('❌ Error loading projects from folder.', 'error');
        }
    },

    // Import project data from JSON format
    importProject: function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            return {
                title: data.metadata.title,
                content: data.content,
                created: data.metadata.created,
                lastModified: data.metadata.lastModified
            };
        } catch (error) {
            console.error('Error importing project data:', error);
            return null;
        }
    },

    // Generate filename for project
    getProjectFileName: function(categoryId, projectId) {
        return `${categoryId}_${projectId}.json`;
    },

    // Download project as JSON file
    downloadProject: function(categoryId, projectId, projectData) {
        const jsonData = this.exportProject(categoryId, projectId, projectData);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = this.getProjectFileName(categoryId, projectId);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Create backup of all projects
    createBackup: function() {
        const allProjects = {};
        
        // Get all projects from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('project_')) {
                const value = localStorage.getItem(key);
                allProjects[key] = JSON.parse(value);
            }
        }
        
        const backupData = {
            timestamp: new Date().toISOString(),
            projects: allProjects
        };
        
        const jsonData = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `projects_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Restore from backup
    restoreBackup: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    // Clear existing projects
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.startsWith('project_')) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    
                    // Restore projects
                    for (const [key, value] of Object.entries(backupData.projects)) {
                        localStorage.setItem(key, JSON.stringify(value));
                    }
                    
                    resolve(Object.keys(backupData.projects).length);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
};

// Add export/import functionality to project pages
if (typeof currentProjectData !== 'undefined') {
    // Add export button to project page
    document.addEventListener('DOMContentLoaded', function() {
        const projectHeader = document.querySelector('.project-header div:last-child');
        if (projectHeader && typeof currentCategoryId !== 'undefined' && typeof currentProjectId !== 'undefined') {
            const exportBtn = document.createElement('button');
            exportBtn.textContent = 'Export';
            exportBtn.className = 'btn btn-secondary';
            exportBtn.onclick = function() {
                DataManager.downloadProject(currentCategoryId, currentProjectId, currentProjectData);
            };
            projectHeader.appendChild(exportBtn);
        }
    });
}

// Add backup functionality to main page
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', function() {
        const adminActions = document.querySelector('.admin-actions');
        if (adminActions) {
            const backupBtn = document.createElement('button');
            backupBtn.textContent = 'Backup All Projects';
            backupBtn.className = 'btn btn-secondary';
            backupBtn.onclick = DataManager.createBackup;
            backupBtn.style.marginLeft = '1rem';
            adminActions.appendChild(backupBtn);
            
            const restoreBtn = document.createElement('button');
            restoreBtn.textContent = 'Restore Backup';
            restoreBtn.className = 'btn btn-secondary';
            restoreBtn.style.marginLeft = '0.5rem';
            restoreBtn.onclick = function() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = async function(e) {
                    if (e.target.files.length > 0) {
                        try {
                            const count = await DataManager.restoreBackup(e.target.files[0]);
                            alert(`Successfully restored ${count} projects!`);
                            location.reload();
                        } catch (error) {
                            alert('Error restoring backup: ' + error.message);
                        }
                    }
                };
                input.click();
            };
            adminActions.appendChild(restoreBtn);
        }
    });
}

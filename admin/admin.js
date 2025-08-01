// Project Management Admin Panel
class ProjectAdmin {
    constructor() {
        this.isLoggedIn = false;
        this.projects = [];
        this.categories = this.getDefaultCategories();
        this.currentEditingProject = null;
        this.currentEditingCategory = null;
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.checkAuthenticationStatus();
        this.loadStoredData();
    }

    setupEventListeners() {
        // Authentication
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthentication();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.performLogout();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Save functionality
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveAllChanges();
        });

        // Project management
        document.getElementById('add-project-btn').addEventListener('click', () => {
            this.openProjectModal();
        });

        document.getElementById('project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProjectData();
        });

        // Category management
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.openCategoryModal();
        });

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategoryData();
        });

        // Modal controls
        document.getElementById('close-project-modal').addEventListener('click', () => {
            this.closeProjectModal();
        });

        document.getElementById('cancel-project').addEventListener('click', () => {
            this.closeProjectModal();
        });

        document.getElementById('close-category-modal').addEventListener('click', () => {
            this.closeCategoryModal();
        });

        document.getElementById('cancel-category').addEventListener('click', () => {
            this.closeCategoryModal();
        });

        // Backup functions
        document.getElementById('export-all-btn').addEventListener('click', () => {
            this.exportAllProjects();
        });

        document.getElementById('export-categories-btn').addEventListener('click', () => {
            this.exportCategories();
        });

        document.getElementById('create-backup-btn').addEventListener('click', () => {
            this.createFullBackup();
        });

        document.getElementById('restore-backup-btn').addEventListener('click', () => {
            this.restoreBackup();
        });

        // Close modals on background click
        document.getElementById('project-modal').addEventListener('click', (e) => {
            if (e.target.id === 'project-modal') {
                this.closeProjectModal();
            }
        });

        document.getElementById('category-modal').addEventListener('click', (e) => {
            if (e.target.id === 'category-modal') {
                this.closeCategoryModal();
            }
        });
    }

    async handleAuthentication() {
        const password = document.getElementById('password-input').value;
        
        // Password validation logic
        const validPassword = await this.validatePassword(password);
        
        if (validPassword) {
            this.isLoggedIn = true;
            this.storeAuthenticationState(true);
            this.showDashboard();
            this.displayMessage('Login successful!', 'success');
        } else {
            this.displayMessage('Invalid password. Please try again.', 'error');
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
            // Fall back to localStorage if available
            const storedPassword = localStorage.getItem('websitePassword');
            if (storedPassword) {
                correctPassword = storedPassword;
            }
        }
        
        return enteredPassword === correctPassword;
    }

    checkAuthenticationStatus() {
        const isAuthenticated = localStorage.getItem('projectAdminAuth') === 'true';
        if (isAuthenticated) {
            this.isLoggedIn = true;
            this.showDashboard();
        } else {
            this.showAuthScreen();
        }
    }

    storeAuthenticationState(isLoggedIn) {
        localStorage.setItem('projectAdminAuth', isLoggedIn.toString());
    }

    performLogout() {
        this.isLoggedIn = false;
        this.storeAuthenticationState(false);
        this.showAuthScreen();
        this.displayMessage('Logged out successfully', 'info');
    }

    showAuthScreen() {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        this.renderProjects();
        this.renderCategories();
        this.populateCategoryDropdown();
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');
    }

    loadStoredData() {
        // Load projects
        const savedProjects = localStorage.getItem('projectAdminData');
        if (savedProjects) {
            try {
                const data = JSON.parse(savedProjects);
                this.projects = data.projects || [];
                this.categories = data.categories || this.getDefaultCategories();
            } catch (error) {
                console.error('Error loading saved data:', error);
                this.projects = [];
                this.categories = this.getDefaultCategories();
            }
        }
    }

    saveAllChanges() {
        const data = {
            projects: this.projects,
            categories: this.categories,
            lastModified: new Date().toISOString()
        };
        
        localStorage.setItem('projectAdminData', JSON.stringify(data));
        this.displayMessage('All changes saved successfully!', 'success');
    }

    // Project Management
    renderProjects() {
        const container = document.getElementById('projects-container');
        
        if (this.projects.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic; grid-column: 1 / -1;">No projects created yet. Click "Add New Project" to get started.</p>';
            return;
        }

        container.innerHTML = this.projects.map(project => `
            <div class="project-item" data-project-id="${project.id}">
                <h3><i class="fas fa-project-diagram"></i> ${project.title}</h3>
                <p>${project.description || 'No description provided'}</p>
                <div class="project-meta">
                    <span class="meta-tag">${this.getCategoryName(project.categoryId)}</span>
                    <span class="meta-tag status-${project.status}">${this.capitalizeFirst(project.status)}</span>
                    <span class="meta-tag priority-${project.priority}">${this.capitalizeFirst(project.priority)} Priority</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small btn-primary" onclick="admin.editProject('${project.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="admin.exportProject('${project.id}')">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <button class="btn btn-small btn-danger" onclick="admin.deleteProject('${project.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCategories() {
        const container = document.getElementById('categories-container');
        
        container.innerHTML = this.categories.map(category => `
            <div class="category-item" data-category-id="${category.id}">
                <h3><i class="${category.icon || 'fas fa-folder'}"></i> ${category.name}</h3>
                <p>${category.description || 'No description provided'}</p>
                <div class="category-meta">
                    <span class="meta-tag">${this.getProjectCount(category.id)} projects</span>
                    <span class="meta-tag">${category.color || 'blue'} theme</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small btn-primary" onclick="admin.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger" onclick="admin.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    populateCategoryDropdown() {
        const select = document.getElementById('project-category');
        select.innerHTML = '<option value="">Select Category</option>' + 
            this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    }

    openProjectModal(projectId = null) {
        this.currentEditingProject = projectId;
        const modal = document.getElementById('project-modal');
        
        if (projectId) {
            // Edit mode
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                document.getElementById('project-modal-title').textContent = 'Edit Project';
                document.getElementById('project-id').value = project.id;
                document.getElementById('project-title').value = project.title;
                document.getElementById('project-category').value = project.categoryId;
                document.getElementById('project-description').value = project.description || '';
                document.getElementById('project-content').value = project.content || '';
                document.getElementById('project-status').value = project.status || 'planning';
                document.getElementById('project-priority').value = project.priority || 'medium';
            }
        } else {
            // Add mode
            document.getElementById('project-modal-title').textContent = 'Add New Project';
            document.getElementById('project-form').reset();
            document.getElementById('project-id').value = '';
        }
        
        modal.classList.add('show');
    }

    closeProjectModal() {
        document.getElementById('project-modal').classList.remove('show');
        this.currentEditingProject = null;
    }

    saveProjectData() {
        const projectData = {
            title: document.getElementById('project-title').value,
            categoryId: document.getElementById('project-category').value,
            description: document.getElementById('project-description').value,
            content: document.getElementById('project-content').value,
            status: document.getElementById('project-status').value,
            priority: document.getElementById('project-priority').value,
            lastModified: new Date().toISOString()
        };

        if (this.currentEditingProject) {
            // Update existing project
            const index = this.projects.findIndex(p => p.id === this.currentEditingProject);
            if (index !== -1) {
                this.projects[index] = { ...this.projects[index], ...projectData };
                this.displayMessage('Project updated successfully!', 'success');
            }
        } else {
            // Add new project
            const newId = Date.now().toString();
            projectData.id = newId;
            projectData.created = new Date().toISOString();
            this.projects.push(projectData);
            this.displayMessage('Project added successfully!', 'success');
        }

        this.renderProjects();
        this.closeProjectModal();
    }

    editProject(projectId) {
        this.openProjectModal(projectId);
    }

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.renderProjects();
            this.displayMessage('Project deleted successfully!', 'info');
        }
    }

    exportProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const exportData = {
                metadata: {
                    type: 'single-project',
                    exported: new Date().toISOString(),
                    version: '1.0'
                },
                project: project
            };
            
            this.downloadJSON(exportData, `project_${project.title.replace(/\s+/g, '_')}.json`);
            this.displayMessage('Project exported successfully!', 'success');
        }
    }

    // Category Management
    openCategoryModal(categoryId = null) {
        this.currentEditingCategory = categoryId;
        const modal = document.getElementById('category-modal');
        
        if (categoryId) {
            // Edit mode
            const category = this.categories.find(c => c.id === categoryId);
            if (category) {
                document.getElementById('category-modal-title').textContent = 'Edit Category';
                document.getElementById('category-id').value = category.id;
                document.getElementById('category-name').value = category.name;
                document.getElementById('category-icon').value = category.icon || 'fas fa-folder';
                document.getElementById('category-description').value = category.description || '';
                document.getElementById('category-color').value = category.color || 'blue';
            }
        } else {
            // Add mode
            document.getElementById('category-modal-title').textContent = 'Add New Category';
            document.getElementById('category-form').reset();
            document.getElementById('category-id').value = '';
            document.getElementById('category-icon').value = 'fas fa-folder';
        }
        
        modal.classList.add('show');
    }

    closeCategoryModal() {
        document.getElementById('category-modal').classList.remove('show');
        this.currentEditingCategory = null;
    }

    saveCategoryData() {
        const categoryData = {
            name: document.getElementById('category-name').value,
            icon: document.getElementById('category-icon').value,
            description: document.getElementById('category-description').value,
            color: document.getElementById('category-color').value
        };

        if (this.currentEditingCategory) {
            // Update existing category
            const index = this.categories.findIndex(c => c.id === this.currentEditingCategory);
            if (index !== -1) {
                this.categories[index] = { ...this.categories[index], ...categoryData };
                this.displayMessage('Category updated successfully!', 'success');
            }
        } else {
            // Add new category
            const newId = categoryData.name.toLowerCase().replace(/\s+/g, '-');
            categoryData.id = newId;
            this.categories.push(categoryData);
            this.displayMessage('Category added successfully!', 'success');
        }

        this.renderCategories();
        this.populateCategoryDropdown();
        this.closeCategoryModal();
    }

    editCategory(categoryId) {
        this.openCategoryModal(categoryId);
    }

    deleteCategory(categoryId) {
        const projectCount = this.getProjectCount(categoryId);
        if (projectCount > 0) {
            this.displayMessage(`Cannot delete category: ${projectCount} projects are using it`, 'error');
            return;
        }

        if (confirm('Are you sure you want to delete this category?')) {
            this.categories = this.categories.filter(c => c.id !== categoryId);
            this.renderCategories();
            this.populateCategoryDropdown();
            this.displayMessage('Category deleted successfully!', 'info');
        }
    }

    // Backup and Export Functions
    exportAllProjects() {
        const exportData = {
            metadata: {
                type: 'all-projects',
                exported: new Date().toISOString(),
                version: '1.0',
                projectCount: this.projects.length
            },
            projects: this.projects
        };
        
        this.downloadJSON(exportData, `all_projects_${new Date().toISOString().split('T')[0]}.json`);
        this.displayMessage('All projects exported successfully!', 'success');
    }

    exportCategories() {
        const exportData = {
            metadata: {
                type: 'categories',
                exported: new Date().toISOString(),
                version: '1.0',
                categoryCount: this.categories.length
            },
            categories: this.categories
        };
        
        this.downloadJSON(exportData, `categories_${new Date().toISOString().split('T')[0]}.json`);
        this.displayMessage('Categories exported successfully!', 'success');
    }

    createFullBackup() {
        const backupData = {
            metadata: {
                type: 'full-backup',
                created: new Date().toISOString(),
                version: '1.0'
            },
            projects: this.projects,
            categories: this.categories
        };
        
        this.downloadJSON(backupData, `project_backup_${new Date().toISOString().split('T')[0]}.json`);
        this.displayMessage('Full backup created successfully!', 'success');
    }

    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (confirm('This will replace all current data. Are you sure you want to restore from backup?')) {
                            if (data.projects) this.projects = data.projects;
                            if (data.categories) this.categories = data.categories;
                            
                            this.renderProjects();
                            this.renderCategories();
                            this.populateCategoryDropdown();
                            this.saveAllChanges();
                            
                            this.displayMessage('Backup restored successfully!', 'success');
                        }
                    } catch (error) {
                        this.displayMessage('Error reading backup file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // Utility Functions
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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

    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : 'Unknown Category';
    }

    getProjectCount(categoryId) {
        return this.projects.filter(p => p.categoryId === categoryId).length;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
    }

    displayMessage(text, type = 'info') {
        const container = document.getElementById('message-container');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.innerHTML = `
            <strong>${type === 'error' ? 'Error:' : type === 'success' ? 'Success:' : 'Info:'}</strong> ${text}
        `;

        container.appendChild(messageElement);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }

    getDefaultCategories() {
        return [
            { id: 'md-alternates', name: 'MD ALTERNATES', icon: 'fas fa-robot', description: 'Murder Drones alternate universe projects', color: 'blue' },
            { id: 'murder-drones', name: 'MURDER DRONES', icon: 'fas fa-robot', description: 'Murder Drones main universe projects', color: 'red' },
            { id: 'undertale', name: 'UNDERTALE', icon: 'fas fa-heart', description: 'Undertale and Deltarune related projects', color: 'green' },
            { id: 'minecraft', name: 'MINECRAFT', icon: 'fas fa-cube', description: 'Minecraft related projects and mods', color: 'orange' },
            { id: 'dnd', name: 'D&D', icon: 'fas fa-dice-d20', description: 'Dungeons & Dragons and tabletop projects', color: 'purple' },
            { id: 'tadc', name: 'TADC', icon: 'fas fa-tv', description: 'The Amazing Digital Circus projects', color: 'teal' },
            { id: 'dandys-world', name: "DANDY'S WORLD", icon: 'fas fa-flower', description: "Dandy's World related projects", color: 'green' },
            { id: 'little-nightmares', name: 'LITTLE NIGHTMARES', icon: 'fas fa-moon', description: 'Little Nightmares universe projects', color: 'purple' }
        ];
    }
}

// Initialize admin panel
const admin = new ProjectAdmin();

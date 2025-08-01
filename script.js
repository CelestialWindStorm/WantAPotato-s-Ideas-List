// Main application state
const AppState = {
    categories: [],
    currentCategory: null,
    currentProject: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    document.getElementById('mainContent').style.display = 'block';
    loadCategories();
    setupEventListeners();
});

// Load categories from the markdown file
async function loadCategories() {
    try {
        // Parse the predefined categories from the markdown file
        const predefinedCategories = [
            { id: 'md-alternates', name: 'MD ALTERNATES', projects: ['Murder Drones: Disassembly', 'Murder Drones: Annihilation', 'Murder Drones: Elite'] },
            { id: 'murder-drones', name: 'MURDER DRONES', projects: ['Murder Drones Project Info', 'Murder Drones: The Video Game', 'Murder Drones: Foundation', 'Real Worker Drone'] },
            { id: 'undertale', name: 'UNDERTALE', projects: ['Deltarune: The Simulation', 'Deltaruin', 'Undertale Dreambound', 'The Undertale Fan Saga', 'Deltarune True Player', 'Undertale short stories'] },
            { id: 'minecraft', name: 'MINECRAFT', projects: ['Voyage', 'The Minecraft Movie', 'Craft of the Dragon', 'Monster Manual', 'Minecraft: The Animated Series', 'R.E.D Detective Agency', 'World of Life Mod'] },
            { id: 'dnd', name: 'D&D', projects: ['Roleplay Corner', 'D&D Foods', 'Castle Dungeon', 'D&D Inperson Preparation', 'Renaissance Costume', 'Robot pets'] },
            { id: 'tadc', name: 'TADC', projects: ['The Amazing Digital Circus: Seventh Human', 'The Amazing Virtual Circus', 'The Moving Circus', 'The Amazing Animated Broadcast'] },
            { id: 'dandys-world', name: 'DANDY\'S WORLD', projects: ['Dandy\'s World: Escape Route'] },
            { id: 'little-nightmares', name: 'LITTLE NIGHTMARES', projects: ['Little Nightmares: Wander To Nowhere'] },
            { id: 'houses', name: 'HOUSES', projects: ['Dream neighborhood'] },
            { id: 'fnaf', name: 'FNAF', projects: ['FNaF: Wonderplace', 'Five Nights at Freddy\'s: Harmony Hollow', 'Fnaf remake'] },
            { id: 'echoes-of-divinity', name: 'ECHOES OF DIVINITY', projects: ['Echoes of Divinity: Call of Kings', 'World of the Fallen God'] },
            { id: 'hollow-knight', name: 'HOLLOW KNIGHT', projects: ['Hollow Knight AU'] },
            { id: 'stories', name: 'STORIES', projects: ['The Concordium Paradox', 'Minecraft Stories', 'Other stories', 'Building Connections', 'Ships-a-lot!', 'The Last Haven', 'Minecraft Series Layout'] },
            { id: 'to-many-ships', name: 'TO MANY SHIPS', projects: ['To Many Ships'] },
            { id: 'castaway', name: 'CASTAWAY', projects: ['Castaway'] },
            { id: 'props', name: 'PROPS', projects: ['Props'] }
        ];

        AppState.categories = predefinedCategories;
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        AppState.categories = [];
        renderCategories();
    }
}

// Render categories on the main page
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    AppState.categories.forEach(category => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'category-card-container';
        
        const card = document.createElement('a');
        card.href = `category.html?id=${category.id}`;
        card.className = 'category-card';
        card.innerHTML = `
            <h3>${category.name}</h3>
            <p>Explore projects in this category</p>
            <span class="project-count">${category.projects.length} projects</span>
        `;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'category-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete Category';
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            showDeleteCategoryModal(category.id, category.name);
        };
        
        cardContainer.appendChild(card);
        cardContainer.appendChild(deleteBtn);
        grid.appendChild(cardContainer);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Category modal
    const categoryModal = document.getElementById('categoryModal');
    const createCategoryBtn = document.getElementById('createCategoryBtn');
    const closeBtn = document.querySelector('.close');
    const categoryForm = document.getElementById('categoryForm');

    if (createCategoryBtn) {
        createCategoryBtn.addEventListener('click', () => {
            if (!dataManager.requireAuth()) return;
            categoryModal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            categoryModal.style.display = 'none';
        });
    }

    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCreateCategory);
    }

    // Export all projects button
    const exportAllBtn = document.getElementById('exportAllBtn');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', exportAllProjects);
    }

    // Import project button
    const importProjectBtn = document.getElementById('importProjectBtn');
    if (importProjectBtn) {
        importProjectBtn.addEventListener('click', () => {
            if (!dataManager.requireAuth()) return;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = handleProjectImport;
            input.click();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === categoryModal) {
            categoryModal.style.display = 'none';
        }
    });
}

// Export all projects
function exportAllProjects() {
    if (!dataManager.requireAuth()) return;
    
    const allProjects = {};
    
    // Get all projects from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('project_')) {
            const value = localStorage.getItem(key);
            allProjects[key] = JSON.parse(value);
        }
    }
    
    const exportData = {
        timestamp: new Date().toISOString(),
        categories: AppState.categories,
        projects: allProjects
    };
    
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_projects_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    dataManager.showNotification('📦 All projects exported successfully!', 'success');
}

// Handle project import
async function handleProjectImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const projectData = await dataManager.loadProjectFromFile(file);
        
        if (projectData.metadata) {
            // Single project import
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
            
            dataManager.showNotification('✅ Project imported successfully!', 'success');
        } else if (projectData.projects) {
            // Full backup import
            let count = 0;
            for (const [key, value] of Object.entries(projectData.projects)) {
                localStorage.setItem(key, JSON.stringify(value));
                count++;
            }
            
            dataManager.showNotification(`✅ Imported ${count} projects from backup!`, 'success');
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        dataManager.showNotification('❌ Error importing project: ' + error.message, 'error');
    }
    
    event.target.value = '';
}

// Handle creating new category
function handleCreateCategory(event) {
    event.preventDefault();
    const categoryName = document.getElementById('categoryName').value.trim();
    
    if (!categoryName) return;

    const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const newCategory = {
        id: categoryId,
        name: categoryName.toUpperCase(),
        projects: []
    };

    AppState.categories.push(newCategory);
    renderCategories();
    
    // Close modal and reset form
    document.getElementById('categoryModal').style.display = 'none';
    document.getElementById('categoryForm').reset();
}

// Utility functions for local storage (for saving project data)
const Storage = {
    saveProject: function(categoryId, projectId, data) {
        const key = `project_${categoryId}_${projectId}`;
        localStorage.setItem(key, JSON.stringify(data));
    },

    loadProject: function(categoryId, projectId) {
        const key = `project_${categoryId}_${projectId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    deleteProject: function(categoryId, projectId) {
        const key = `project_${categoryId}_${projectId}`;
        localStorage.removeItem(key);
    },

    deleteCategory: function(categoryId) {
        // Remove all projects in this category
        const projectKeys = Object.keys(localStorage).filter(key => 
            key.startsWith(`project_${categoryId}_`)
        );
        projectKeys.forEach(key => localStorage.removeItem(key));
    }
};

// URL parameter utilities
const URLUtils = {
    getParam: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    setParam: function(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    }
};

// Category deletion functions
function showDeleteCategoryModal(categoryId, categoryName) {
    if (!dataManager.requireAuth()) return;
    
    const category = AppState.categories.find(c => c.id === categoryId);
    const projectCount = category ? category.projects.length : 0;
    
    let message = `Are you sure you want to delete the category "${categoryName}"?`;
    if (projectCount > 0) {
        message += `\n\nThis will also delete ${projectCount} project${projectCount === 1 ? '' : 's'} in this category.`;
    }
    message += '\n\nThis action cannot be undone.';
    
    if (confirm(message)) {
        deleteCategory(categoryId);
    }
}

function deleteCategory(categoryId) {
    // Remove from AppState
    AppState.categories = AppState.categories.filter(c => c.id !== categoryId);
    
    // Remove from localStorage
    Storage.deleteCategory(categoryId);
    
    // Re-render categories
    renderCategories();
    
    // Show success message
    setTimeout(() => {
        alert('Category deleted successfully!');
    }, 100);
}

// String utilities
const StringUtils = {
    slugify: function(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    },

    truncate: function(text, length = 100) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
};

// Main application state
const AppState = {
    categories: [],
    currentCategory: null,
    currentProject: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
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
        const card = document.createElement('a');
        card.href = `category.html?id=${category.id}`;
        card.className = 'category-card';
        card.innerHTML = `
            <h3>${category.name}</h3>
            <p>Explore projects in this category</p>
            <span class="project-count">${category.projects.length} projects</span>
        `;
        grid.appendChild(card);
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

    // Connect folder button
    const connectFolderBtn = document.getElementById('connectFolderBtn');
    if (connectFolderBtn && typeof DataManager !== 'undefined') {
        connectFolderBtn.addEventListener('click', async () => {
            const success = await DataManager.initializeFolderAccess();
            if (success) {
                connectFolderBtn.textContent = '✅ Folder Connected';
                connectFolderBtn.disabled = true;
                connectFolderBtn.style.background = '#38a169';
                connectFolderBtn.style.color = 'white';
            }
        });
    }

    // Load all projects button
    const loadAllProjectsBtn = document.getElementById('loadAllProjectsBtn');
    if (loadAllProjectsBtn && typeof DataManager !== 'undefined') {
        loadAllProjectsBtn.addEventListener('click', async () => {
            await DataManager.loadAllProjectsFromFolder();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === categoryModal) {
            categoryModal.style.display = 'none';
        }
    });
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

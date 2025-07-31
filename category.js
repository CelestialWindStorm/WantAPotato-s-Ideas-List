// Category page functionality
let currentCategoryData = null;

document.addEventListener('DOMContentLoaded', function() {
    loadCategoryPage();
    setupCategoryEventListeners();
});

async function loadCategoryPage() {
    const categoryId = URLUtils.getParam('id');
    
    if (!categoryId) {
        window.location.href = 'index.html';
        return;
    }

    // Load categories first
    await loadCategories();
    
    // Find the current category
    currentCategoryData = AppState.categories.find(cat => cat.id === categoryId);
    
    if (!currentCategoryData) {
        document.getElementById('categoryTitle').textContent = 'Category Not Found';
        document.getElementById('categoryDescription').textContent = 'The requested category could not be found.';
        return;
    }

    // Update page title and header
    document.title = `${currentCategoryData.name} - WantAPotato's Ideas List`;
    document.getElementById('categoryTitle').textContent = currentCategoryData.name;
    document.getElementById('categoryDescription').textContent = `Browse ${currentCategoryData.projects.length} projects in this category`;

    renderProjects();
}

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const noProjectsMessage = document.getElementById('noProjectsMessage');
    
    if (!currentCategoryData || currentCategoryData.projects.length === 0) {
        grid.innerHTML = '';
        noProjectsMessage.style.display = 'block';
        return;
    }

    noProjectsMessage.style.display = 'none';
    grid.innerHTML = '';

    currentCategoryData.projects.forEach(projectName => {
        const projectId = StringUtils.slugify(projectName);
        const savedProject = Storage.loadProject(currentCategoryData.id, projectId);
        
        const card = document.createElement('a');
        card.href = `project.html?category=${currentCategoryData.id}&project=${projectId}`;
        card.className = 'project-card';
        
        let preview = 'No content yet';
        if (savedProject && savedProject.content && savedProject.content.length > 0) {
            const textBlocks = savedProject.content.filter(block => block.type === 'text');
            if (textBlocks.length > 0) {
                preview = StringUtils.truncate(textBlocks[0].content, 80);
            }
        }
        
        card.innerHTML = `
            <h3>${projectName}</h3>
            <div class="project-preview">${preview}</div>
        `;
        
        grid.appendChild(card);
    });
}

function setupCategoryEventListeners() {
    const projectModal = document.getElementById('projectModal');
    const createProjectBtn = document.getElementById('createProjectBtn');
    const closeBtn = document.querySelector('.close');
    const projectForm = document.getElementById('projectForm');

    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', () => {
            projectModal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            projectModal.style.display = 'none';
        });
    }

    if (projectForm) {
        projectForm.addEventListener('submit', handleCreateProject);
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === projectModal) {
            projectModal.style.display = 'none';
        }
    });
}

function handleCreateProject(event) {
    event.preventDefault();
    const projectName = document.getElementById('projectName').value.trim();
    
    if (!projectName || !currentCategoryData) return;

    // Add project to category
    if (!currentCategoryData.projects.includes(projectName)) {
        currentCategoryData.projects.push(projectName);
    }

    const projectId = StringUtils.slugify(projectName);
    
    // Create initial project data
    const initialProject = {
        title: projectName,
        content: [
            {
                type: 'text',
                content: 'Start writing your project description here...'
            }
        ],
        lastModified: new Date().toISOString()
    };

    // Save project
    Storage.saveProject(currentCategoryData.id, projectId, initialProject);
    
    // Redirect to project editor
    window.location.href = `project.html?category=${currentCategoryData.id}&project=${projectId}`;
}

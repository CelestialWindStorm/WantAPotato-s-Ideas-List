// Project page functionality
let currentProjectData = null;
let currentCategoryId = null;
let currentProjectId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadProjectPage();
    setupProjectEventListeners();
});

async function loadProjectPage() {
    // Check authentication first
    if (typeof DataManager !== 'undefined') {
        const isAuthenticated = await DataManager.initializeAuth();
        if (!isAuthenticated) {
            DataManager.showAuthModal();
            return;
        }
    }

    currentCategoryId = URLUtils.getParam('category');
    currentProjectId = URLUtils.getParam('project');
    
    if (!currentCategoryId || !currentProjectId) {
        window.location.href = 'index.html';
        return;
    }

    // Load categories to get project name
    await loadCategories();
    const category = AppState.categories.find(cat => cat.id === currentCategoryId);
    
    if (!category) {
        window.location.href = 'index.html';
        return;
    }

    // Update breadcrumb
    document.getElementById('categoryLink').href = `category.html?id=${currentCategoryId}`;
    document.getElementById('categoryLink').textContent = category.name;

    // Load project data
    currentProjectData = Storage.loadProject(currentCategoryId, currentProjectId);
    
    if (!currentProjectData) {
        // Create default project if it doesn't exist
        const projectName = category.projects.find(p => StringUtils.slugify(p) === currentProjectId) || 'Untitled Project';
        currentProjectData = {
            title: projectName,
            content: [
                {
                    type: 'text',
                    content: 'Start writing your project description here...'
                }
            ],
            lastModified: new Date().toISOString()
        };
        saveProject();
    }

    renderProject();
}

function renderProject() {
    if (!currentProjectData) return;

    // Update title and metadata
    document.getElementById('projectTitle').value = currentProjectData.title;
    document.getElementById('projectBreadcrumb').textContent = currentProjectData.title;
    document.title = `${currentProjectData.title} - WantAPotato's Ideas List`;
    
    if (currentProjectData.lastModified) {
        const date = new Date(currentProjectData.lastModified);
        document.getElementById('lastModified').textContent = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    }

    // Render content blocks
    renderContentBlocks();
}

function renderContentBlocks() {
    const container = document.getElementById('editorContainer');
    container.innerHTML = '';

    if (!currentProjectData.content || currentProjectData.content.length === 0) {
        currentProjectData.content = [{
            type: 'text',
            content: 'Start writing your project description here...'
        }];
    }

    currentProjectData.content.forEach((block, index) => {
        const blockElement = createContentBlock(block, index);
        container.appendChild(blockElement);
    });
}

function createContentBlock(block, index) {
    const blockDiv = document.createElement('div');
    blockDiv.className = 'content-block';
    blockDiv.dataset.index = index;

    const header = document.createElement('div');
    header.className = 'content-block-header';
    
    const typeSpan = document.createElement('span');
    typeSpan.textContent = block.type.charAt(0).toUpperCase() + block.type.slice(1);
    typeSpan.style.fontWeight = 'bold';
    typeSpan.style.color = '#667eea';
    
    const actions = document.createElement('div');
    actions.className = 'content-block-actions';
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'btn btn-secondary';
    editBtn.style.fontSize = '0.8rem';
    editBtn.style.padding = '0.4rem 0.8rem';
    editBtn.onclick = () => toggleEdit(index);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.style.fontSize = '0.8rem';
    deleteBtn.style.padding = '0.4rem 0.8rem';
    deleteBtn.onclick = () => deleteContentBlock(index);
    
    const moveUpBtn = document.createElement('button');
    moveUpBtn.textContent = '↑';
    moveUpBtn.className = 'btn btn-secondary';
    moveUpBtn.style.fontSize = '0.8rem';
    moveUpBtn.style.padding = '0.4rem 0.6rem';
    moveUpBtn.onclick = () => moveContentBlock(index, -1);
    moveUpBtn.disabled = index === 0;
    
    const moveDownBtn = document.createElement('button');
    moveDownBtn.textContent = '↓';
    moveDownBtn.className = 'btn btn-secondary';
    moveDownBtn.style.fontSize = '0.8rem';
    moveDownBtn.style.padding = '0.4rem 0.6rem';
    moveDownBtn.onclick = () => moveContentBlock(index, 1);
    moveDownBtn.disabled = index === currentProjectData.content.length - 1;

    actions.appendChild(moveUpBtn);
    actions.appendChild(moveDownBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    header.appendChild(typeSpan);
    header.appendChild(actions);
    
    const content = document.createElement('div');
    content.className = 'content-block-content';
    
    if (block.type === 'text') {
        const textarea = document.createElement('textarea');
        textarea.value = block.content || '';
        textarea.style.display = 'none';
        textarea.onchange = () => updateContentBlock(index, textarea.value);
        
        const preview = document.createElement('div');
        preview.style.whiteSpace = 'pre-wrap';
        preview.textContent = block.content || 'Empty text block';
        
        content.appendChild(preview);
        content.appendChild(textarea);
    } else if (block.type === 'image') {
        const img = document.createElement('img');
        img.src = block.content || '';
        img.alt = 'Project image';
        img.style.maxWidth = '100%';
        img.onerror = () => {
            img.style.display = 'none';
            const errorMsg = document.createElement('p');
            errorMsg.textContent = 'Image could not be loaded';
            errorMsg.style.color = '#e53e3e';
            content.appendChild(errorMsg);
        };
        
        const urlInput = document.createElement('input');
        urlInput.type = 'url';
        urlInput.value = block.content || '';
        urlInput.placeholder = 'Image URL';
        urlInput.style.display = 'none';
        urlInput.onchange = () => {
            updateContentBlock(index, urlInput.value);
            img.src = urlInput.value;
        };
        
        content.appendChild(img);
        content.appendChild(urlInput);
    } else if (block.type === 'title') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = block.content || '';
        input.style.display = 'none';
        input.onchange = () => updateContentBlock(index, input.value);
        
        const heading = document.createElement('h2');
        heading.textContent = block.content || 'Untitled Section';
        heading.style.margin = '0';
        heading.style.color = '#2d3748';
        
        content.appendChild(heading);
        content.appendChild(input);
    }

    blockDiv.appendChild(header);
    blockDiv.appendChild(content);
    
    return blockDiv;
}

function toggleEdit(index) {
    const block = document.querySelector(`[data-index="${index}"]`);
    const isEditing = block.classList.contains('editing');
    
    if (isEditing) {
        // Stop editing
        block.classList.remove('editing');
        const editableElement = block.querySelector('textarea, input[type="text"], input[type="url"]');
        const displayElement = block.querySelector('div, h2, img');
        
        if (editableElement && displayElement) {
            editableElement.style.display = 'none';
            displayElement.style.display = 'block';
            
            // Update display
            if (displayElement.tagName === 'IMG') {
                displayElement.src = editableElement.value;
            } else {
                displayElement.textContent = editableElement.value || 'Empty';
            }
        }
        
        block.querySelector('button').textContent = 'Edit';
    } else {
        // Start editing
        block.classList.add('editing');
        const editableElement = block.querySelector('textarea, input[type="text"], input[type="url"]');
        const displayElement = block.querySelector('div, h2, img');
        
        if (editableElement && displayElement) {
            editableElement.style.display = 'block';
            displayElement.style.display = 'none';
            editableElement.focus();
        }
        
        block.querySelector('button').textContent = 'Done';
    }
}

function updateContentBlock(index, content) {
    if (currentProjectData.content[index]) {
        currentProjectData.content[index].content = content;
        currentProjectData.lastModified = new Date().toISOString();
        
        // Auto-save to localStorage
        Storage.saveProject(currentCategoryId, currentProjectId, currentProjectData);
    }
}

function deleteContentBlock(index) {
    if (currentProjectData.content.length > 1) {
        currentProjectData.content.splice(index, 1);
        currentProjectData.lastModified = new Date().toISOString();
        renderContentBlocks();
    } else {
        alert('Cannot delete the last content block.');
    }
}

function moveContentBlock(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < currentProjectData.content.length) {
        const temp = currentProjectData.content[index];
        currentProjectData.content[index] = currentProjectData.content[newIndex];
        currentProjectData.content[newIndex] = temp;
        currentProjectData.lastModified = new Date().toISOString();
        renderContentBlocks();
    }
}

function addContentBlock(type) {
    if (typeof DataManager !== 'undefined' && !DataManager.requireAuth()) return;
    
    const newBlock = {
        type: type,
        content: type === 'text' ? 'New text content...' : 
                type === 'title' ? 'New Section Title' : 
                ''
    };
    
    currentProjectData.content.push(newBlock);
    currentProjectData.lastModified = new Date().toISOString();
    
    // Save changes
    Storage.saveProject(currentCategoryId, currentProjectId, currentProjectData);
    
    renderContentBlocks();
    
    // Automatically start editing the new block
    const newIndex = currentProjectData.content.length - 1;
    setTimeout(() => toggleEdit(newIndex), 100);
}

function saveProject() {
    if (typeof DataManager !== 'undefined' && !DataManager.requireAuth()) return;
    if (!currentProjectData || !currentCategoryId || !currentProjectId) return;
    
    // Update title
    currentProjectData.title = document.getElementById('projectTitle').value;
    currentProjectData.lastModified = new Date().toISOString();
    
    // Save to localStorage
    Storage.saveProject(currentCategoryId, currentProjectId, currentProjectData);
    
    // Update display
    document.getElementById('lastModified').textContent = new Date().toLocaleDateString() + ' at ' + new Date().toLocaleTimeString();
    
    // Show feedback
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    saveBtn.style.background = '#38a169';
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
    }, 1500);
}

function deleteProject() {
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmDelete() {
    // Remove from localStorage
    Storage.deleteProject(currentCategoryId, currentProjectId);
    
    // Also remove from the category's project list if we have access to AppState
    if (typeof AppState !== 'undefined' && AppState.categories) {
        const category = AppState.categories.find(c => c.id === currentCategoryId);
        if (category && currentProjectData) {
            category.projects = category.projects.filter(p => 
                StringUtils.slugify(p) !== currentProjectId
            );
        }
    }
    
    window.location.href = `category.html?id=${currentCategoryId}`;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

function setupProjectEventListeners() {
    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveProject);
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
        if (typeof DataManager !== 'undefined') {
            DataManager.downloadProject(currentCategoryId, currentProjectId, currentProjectData);
        }
    });
    
    // Load button
    document.getElementById('loadBtn').addEventListener('click', loadProjectFromFile);
    
    // Delete button
    document.getElementById('deleteBtn').addEventListener('click', deleteProject);
    
    // Title input
    document.getElementById('projectTitle').addEventListener('input', function() {
        document.getElementById('projectBreadcrumb').textContent = this.value;
    });
    
    // File input for loading projects
    document.getElementById('fileInput').addEventListener('change', handleFileLoad);
    
    // Auto-save to localStorage
    let autoSaveInterval;
    const startAutoSave = () => {
        clearInterval(autoSaveInterval);
        autoSaveInterval = setInterval(() => {
            Storage.saveProject(currentCategoryId, currentProjectId, currentProjectData);
        }, 30000); // Auto-save to localStorage every 30 seconds
    };
    startAutoSave();
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            saveProject();
        }
        if (event.ctrlKey && event.key === 'o') {
            event.preventDefault();
            loadProjectFromFile();
        }
    });
}

function loadProjectFromFile() {
    document.getElementById('fileInput').click();
}

async function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const projectData = await DataManager.loadProjectFromFile(file);
        
        if (projectData.metadata) {
            // Load from exported format
            currentProjectData = {
                title: projectData.metadata.title,
                content: projectData.content,
                created: projectData.metadata.created,
                lastModified: projectData.metadata.lastModified
            };
        } else {
            // Load from direct format
            currentProjectData = projectData;
        }
        
        // Save to localStorage
        Storage.saveProject(currentCategoryId, currentProjectId, currentProjectData);
        
        // Re-render the project
        renderProject();
        
        // Show success message
        alert('Project loaded successfully!');
        
    } catch (error) {
        alert('Error loading project file: ' + error.message);
    }
    
    // Clear the file input
    event.target.value = '';
}

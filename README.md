# WantAPotato's Ideas List - Project Management Website

A comprehensive web-based project management system for organizing and managing creative project ideas across different categories.

## Features

### 🏠 Main Page (index.html)
- **Category Overview**: View all project categories with project counts
- **Create Categories**: Add new project categories
- **Backup/Restore**: Export and import all project data

### 📁 Category Pages (category.html)
- **Project Listing**: View all projects within a category
- **Project Creation**: Add new projects to the category
- **Project Previews**: See content previews for each project

### ✏️ Project Editor (project.html)
- **Rich Content Editing**: Add and edit different types of content blocks:
  - **Text Blocks**: For descriptions, notes, and detailed content
  - **Image Blocks**: Add images via URL or file upload
  - **Title Blocks**: Create section headers and organize content
- **Content Management**:
  - Reorder content blocks with up/down arrows
  - Edit blocks inline
  - Delete unwanted blocks
- **Auto-Save**: Automatically saves every 30 seconds
- **Manual Save**: Ctrl+S or Save button
- **Export**: Download individual projects as JSON files

## Getting Started

1. **Open the Website**: Open `index.html` in your web browser
2. **Browse Categories**: Click on any category to view its projects
3. **Create Projects**: Use the "Create New Project" button in category pages
4. **Edit Content**: Click on project names to open the editor
5. **Add Content**: Use the "Add Content" buttons to insert text, images, or titles

## Pre-loaded Categories

The website comes with the following categories from your original list:

- **MD ALTERNATES**: Murder Drones alternatives
- **MURDER DRONES**: Murder Drones projects
- **UNDERTALE**: Undertale and Deltarune projects
- **MINECRAFT**: Minecraft-related projects
- **D&D**: Dungeons & Dragons projects
- **TADC**: The Amazing Digital Circus projects
- **DANDY'S WORLD**: Dandy's World projects
- **LITTLE NIGHTMARES**: Little Nightmares projects
- **HOUSES**: Housing/architecture projects
- **FNAF**: Five Nights at Freddy's projects
- **ECHOES OF DIVINITY**: Echoes of Divinity projects
- **HOLLOW KNIGHT**: Hollow Knight projects
- **STORIES**: Story and narrative projects
- **TO MANY SHIPS**: Shipping projects
- **CASTAWAY**: Castaway projects
- **PROPS**: Props and physical items

## Data Storage & File System Integration

### � **Direct Folder Access (Recommended)**
- **Connect Folder**: Click "Connect Project Folder" on the main page to link directly to your `project pages` folder
- **Auto-Save to Folder**: Once connected, all changes save directly to the folder (Chrome/Edge/Opera)
- **Load All Projects**: Import all existing JSON files from the connected folder
- **Seamless Workflow**: No more moving files - everything saves where it belongs!

### 📁 **File Management**
- **JSON Format**: All projects are saved in clean, readable JSON format
- **Load Projects**: Use "Load from File" button to import individual project files
- **File Names**: Format: `categoryid_projectid.json` (e.g., `minecraft_voyage.json`)
- **Bulk Import**: Load all projects at once from your project pages folder

### � **Fallback Options**
- **Download Mode**: If folder access isn't available, files download to your Downloads folder
- **Manual Organization**: Move downloaded files to the `project pages` folder as needed
- **Cross-Browser**: Works in all browsers, with enhanced features in modern ones

### �💾 **Dual Storage System**
- **Browser Storage**: Immediate saving for seamless editing experience
- **File System**: Persistent JSON files for backup and sharing
- **Sync**: Both systems stay synchronized automatically

### ⚙️ **Browser Support**
- **Full Features**: Chrome, Edge, Opera (File System Access API)
- **Basic Features**: Firefox, Safari (download-based)
- **Progressive Enhancement**: Automatically uses best available method

## File Structure

```
WantAPotato's Ideas List/
├── index.html              # Main page
├── category.html            # Category view page
├── project.html             # Project editor page
├── styles.css               # All styling
├── script.js                # Main JavaScript functionality
├── category.js              # Category page functionality
├── project.js               # Project editor functionality
├── data-manager.js          # Data export/import utilities
├── document references/     # Reference documents
│   └── List Of Projects.md  # Original project list
└── project pages/           # Folder for saved project files
```

## Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript to be enabled
- Local storage support required for data persistence

## Tips for Use

1. **Regular Backups**: Use the backup feature regularly to save your work
2. **Organize Content**: Use title blocks to create clear sections in your projects
3. **Image Management**: Use reliable image hosting for images (imgur, etc.)
4. **Keyboard Shortcuts**: Use Ctrl+S to quickly save projects
5. **Content Blocks**: Reorder blocks to create better flow in your projects

## Troubleshooting

- **Data Not Saving**: Check if browser allows local storage
- **Images Not Loading**: Verify image URLs are correct and accessible
- **Lost Projects**: Use the restore backup feature if available
- **Browser Issues**: Try refreshing the page or clearing browser cache

## Future Enhancements

The website is designed to be easily extensible. Potential additions could include:
- Cloud storage integration
- Collaborative editing
- Search functionality
- Tags and filtering
- Project templates
- Image upload to cloud storage

Enjoy organizing your creative projects! 🥔✨

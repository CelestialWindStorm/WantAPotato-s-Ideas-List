# WantAPotato's Ideas List - Secure Project Management System

A password-protected web-based project management system for organizing and managing creative project ideas across different categories. Optimized for GitHub Pages deployment.

## 🔐 Security Features

### **Password Protection**
- **Login Required**: All functionality requires authentication
- **Session Management**: 24-hour session timeout for security
- **Default Password**: `WantAPotato2025!` (change this in `data-manager.js`)
- **Logout Function**: Secure logout available on all pages

## 🌐 GitHub Pages Deployment

This website is ready for GitHub Pages! See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup instructions.

**Quick Setup:**
1. Enable GitHub Pages in repository settings
2. Your site will be available at: `https://[username].github.io/[repo-name]/`
3. Change the default password in `data-manager.js`

## Features

### 🏠 Main Page (index.html)
- **Authentication Gate**: Password protection for access
- **Category Overview**: View all project categories with project counts
- **Create Categories**: Add new project categories
- **Export/Import**: Backup and restore all project data

### 📁 Category Pages (category.html)
- **Project Listing**: View all projects within a category
- **Project Creation**: Add new projects to the category
- **Project Previews**: See content previews for each project

### ✏️ Project Editor (project.html)
- **Rich Content Editing**: Add and edit different types of content blocks:
  - **Text Blocks**: For descriptions, notes, and detailed content
  - **Image Blocks**: Add images via URL
  - **Title Blocks**: Create section headers and organize content
- **Content Management**:
  - Reorder content blocks with up/down arrows
  - Edit blocks inline
  - Delete unwanted blocks
- **Auto-Save**: Automatically saves to browser storage
- **Manual Save**: Save button for immediate saving
- **Export**: Download individual projects as JSON files

## Getting Started

### 🔐 **First Time Setup**
1. **Authentication**: The website will ask for a password on first visit
2. **Default Password**: `WantAPotato2025!` (you can change this)
3. **Login**: Enter the password to access the system
4. **Session**: You'll stay logged in for 24 hours

### 📝 **Using the System**
1. **Browse Categories**: Click on any category to view its projects
2. **Create Projects**: Use the "Create New Project" button in category pages
3. **Edit Content**: Click on project names to open the editor
4. **Add Content**: Use the "Add Content" buttons to insert text, images, or titles
5. **Export Data**: Use export buttons to backup your projects

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

## Data Storage & Security

### 🔐 **Authentication System**
- **Password Protection**: Simple but effective client-side authentication
- **Session Management**: 24-hour automatic logout for security
- **Access Control**: All create/edit functions require authentication
- **Customizable**: Easy to change password in source code

### 💾 **Browser-Based Storage**
- **Local Storage**: All data stored securely in browser's localStorage
- **No Server Required**: Perfect for static GitHub Pages hosting
- **Export/Import**: Full backup and restore functionality
- **Data Portability**: JSON format for easy data transfer

### 📤 **Data Management**
- **Export Projects**: Download individual projects as JSON files
- **Export All**: Create complete backup of all projects and categories
- **Import Support**: Load individual projects or full backups
- **Cross-Browser**: Works on all modern browsers

## File Structure (GitHub Pages Ready)

```
Repository Root/
├── index.html              # Main page (GitHub Pages entry point)
├── category.html            # Category view page
├── project.html             # Project editor page
├── styles.css               # All styling
├── script.js                # Main JavaScript functionality
├── category.js              # Category page functionality
├── project.js               # Project editor functionality
├── data-manager.js          # Authentication & data management
├── _config.yml              # GitHub Pages configuration
├── README.md                # Documentation
├── DEPLOYMENT.md            # Deployment guide
├── document references/     # Reference documents
│   └── List Of Projects.md  # Original project list
└── project pages/           # Sample project files
    └── sample_project_format.json
```

## Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript to be enabled
- Local storage support required for data persistence
- HTTPS recommended (automatically provided by GitHub Pages)

## Security Considerations

### **Current Protection Level:**
- **Client-side authentication** (good for personal use)
- **Password stored in JavaScript** (visible to determined users)
- **Session management** (24-hour timeout)

### **For Enhanced Security (Optional Future Upgrades):**
- Consider GitHub's authentication APIs
- Use encrypted password storage
- Add two-factor authentication
- Implement server-side validation

## Tips for Use

1. **Regular Backups**: Use the "Export All" feature regularly to save your work
2. **Password Security**: Change the default password in `data-manager.js`
3. **Organize Content**: Use title blocks to create clear sections in your projects
4. **Image Management**: Use reliable image hosting for images (imgur, etc.)
5. **Keyboard Shortcuts**: Use Ctrl+S to quickly save projects

## Troubleshooting

- **Data Not Saving**: Check if browser allows local storage
- **Images Not Loading**: Verify image URLs are correct and accessible
- **Lost Projects**: Use the import backup feature if available
- **Browser Issues**: Try refreshing the page or clearing browser cache
- **Authentication Issues**: Clear browser data and try logging in again

## Future Enhancements

The website is designed to be easily extensible. Potential additions could include:
- Server-side authentication integration
- Cloud storage synchronization
- Collaborative editing features
- Search functionality across projects
- Tags and advanced filtering
- Project templates
- Mobile app companion

Enjoy organizing your creative projects securely! 🥔✨🔐

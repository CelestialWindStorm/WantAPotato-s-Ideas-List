// Enhanced authentication with password hashing
const SecureAuth = {
    // SHA-256 hash function
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // Verify password against stored hash
    async verifyPassword(inputPassword, storedHash) {
        const inputHash = await this.hashPassword(inputPassword);
        return inputHash === storedHash;
    },

    // Generate password hash (use this to create your hash)
    async generateHash(password) {
        return await this.hashPassword(password);
    }
};

// Enhanced DataManager with secure authentication
const SecureDataManager = {
    ...DataManager, // Inherit all existing functionality
    
    // Secure authentication with hashed password
    async authenticate(password) {
        // Your password hash - generate this by calling SecureAuth.generateHash("YourPassword")
        // Example: this is the hash for "WantAPotato2025!"
        const correctPasswordHash = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"; // Replace with your actual hash
        
        const isValid = await SecureAuth.verifyPassword(password, correctPasswordHash);
        
        if (isValid) {
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
    }
};

// Password hash generator utility (remove after generating your hash)
async function generateMyPasswordHash() {
    const myPassword = "YourNewPasswordHere"; // Replace with your desired password
    const hash = await SecureAuth.generateHash(myPassword);
    console.log("Your password hash:", hash);
    console.log("Replace the correctPasswordHash variable with this value");
}

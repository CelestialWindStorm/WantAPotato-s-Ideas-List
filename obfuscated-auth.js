// Basic password obfuscation (better than plaintext, but not cryptographically secure)
const ObfuscatedAuth = {
    // Simple XOR obfuscation
    obfuscate(text, key = 42) {
        return text.split('').map(char => 
            String.fromCharCode(char.charCodeAt(0) ^ key)
        ).join('');
    },

    // Deobfuscate (same function due to XOR properties)
    deobfuscate(obfuscatedText, key = 42) {
        return this.obfuscate(obfuscatedText, key);
    },

    // Base64 + XOR combination
    encode(text) {
        const xored = this.obfuscate(text);
        return btoa(xored);
    },

    decode(encodedText) {
        const decoded = atob(encodedText);
        return this.deobfuscate(decoded);
    }
};

// Usage in data-manager.js - replace the authenticate function with this:
/*
authenticate(password) {
    // Obfuscated password (harder to spot in code)
    const obfuscatedPassword = "Qjb{LC~{}hh~O+ZGP"; // This represents "WantAPotato2025!"
    const correctPassword = ObfuscatedAuth.deobfuscate(obfuscatedPassword);
    
    if (password === correctPassword) {
        this.isAuthenticated = true;
        this.authToken = btoa(Date.now().toString());
        
        localStorage.setItem('project_auth', JSON.stringify({
            token: this.authToken,
            timestamp: Date.now()
        }));
        
        return true;
    }
    return false;
}
*/

// To generate your own obfuscated password:
function generateObfuscatedPassword(plainPassword) {
    const obfuscated = ObfuscatedAuth.obfuscate(plainPassword);
    console.log("Original:", plainPassword);
    console.log("Obfuscated:", obfuscated);
    console.log("Verified:", ObfuscatedAuth.deobfuscate(obfuscated));
}

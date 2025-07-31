# Authentication Troubleshooting Guide

## Issue: Password Authentication Not Working

If your GitHub Secrets password isn't working, here are the most likely causes and solutions:

### 1. **Check GitHub Secret Configuration**

**Verify Secret Name:**
- Go to your GitHub repository
- Navigate to Settings → Secrets and variables → Actions
- Ensure you have a secret named exactly: `WEBSITE_PASSWORD`
- **Case matters!** It must be all uppercase

**Secret Value:**
- Make sure there are no extra spaces before/after your password
- Avoid special characters that might cause issues: `$`, `` ` ``, `"`, `'`, `\`
- Use a simple password with letters, numbers, and basic symbols like `-`, `_`, `!`

### 2. **GitHub Actions Deployment**

**Check Deployment Status:**
- Go to the "Actions" tab in your GitHub repository
- Look for the latest deployment workflow
- If it shows a red ❌, click on it to see the error
- Look for the "Replace password placeholder" step

**Common Issues:**
- **Secret not set**: You'll see "WEBSITE_PASSWORD secret is not set!"
- **Deployment failed**: The workflow failed before password replacement
- **File not found**: The data-manager.js file wasn't found during deployment

### 3. **Test Authentication Locally**

**Open Browser Developer Tools:**
1. Press F12 or right-click → Inspect
2. Go to the Console tab
3. Try logging in
4. Look for these messages:
   - `Authentication attempt:` - Shows password lengths
   - `WARNING: Password placeholder was not replaced` - Deployment issue
   - Any error messages

### 4. **Quick Fixes to Try**

**Option A: Simple Password**
- Try setting a very simple password like: `test123`
- No special characters, just letters and numbers

**Option B: Redeploy**
1. Make any small change to your repository (add a space to README)
2. Commit and push the change
3. Wait for GitHub Actions to redeploy
4. Try your password again

**Option C: Check the Live Site**
- Visit your deployed site
- Open Developer Tools (F12) → Console
- Try logging in and check for error messages

### 5. **Alternative Authentication Methods**

If GitHub Secrets continue to cause issues, we can implement:
- Hash-based authentication (password is hashed, more secure)
- OAuth with GitHub login
- Time-based temporary passwords
- Local storage bypass for testing

### 6. **Verification Steps**

To confirm everything is working:

1. **Check secret exists**: Repository → Settings → Secrets → WEBSITE_PASSWORD
2. **Check deployment**: Actions tab → Latest workflow → All green checkmarks
3. **Check password replacement**: Console shows correct password length
4. **Test login**: Password works on deployed site

## Need Help?

If none of these solutions work:
1. Share the error message from browser console
2. Check if the GitHub Actions deployment shows any errors
3. Verify the secret name is exactly `WEBSITE_PASSWORD`
4. Try a very simple password without special characters

The most common issue is either:
- Secret name is wrong (should be `WEBSITE_PASSWORD`)
- Password contains special characters that break the replacement
- GitHub Actions deployment failed

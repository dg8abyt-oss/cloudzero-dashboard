// IN public/script.js

// 1. Fetch Config
fetch('/api/config') // Vercel automatically routes this to api/config.js
    .then(response => response.json())
    .then(data => { configData = data; });

// 2. Verify Password
async function checkSitePassword() {
    // ... existing code ...
    const response = await fetch('/api/verify', { // Routes to api/verify.js
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: input })
    });
    // ... existing code ...
}

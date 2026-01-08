let configData = null;
let pendingPlan = null;
let html5QrcodeScanner = null;

// 1. Fetch Config
fetch('/api/config')
    .then(res => {
        if (!res.ok) throw new Error("Config not found");
        return res.json();
    })
    .then(data => { configData = data; })
    .catch(err => console.error("Error loading config:", err));

// 2. Check Password
async function checkSitePassword() {
    // FIX: Defined 'input' correctly
    const input = document.getElementById('site-password').value;
    const errorMsg = document.getElementById('login-error');
    errorMsg.textContent = "Verifying...";

    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: input })
        });
        
        const result = await response.json();

        if (result.success) {
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            initializeDashboard();
        } else {
            errorMsg.textContent = "Incorrect password.";
        }
    } catch (error) {
        errorMsg.textContent = "Server connection failed.";
    }
}

// 3. QR Scanner
function toggleScanner() {
    const readerDiv = document.getElementById('reader');
    if (!readerDiv.classList.contains('hidden')) {
        readerDiv.classList.add('hidden');
        if (html5QrcodeScanner) html5QrcodeScanner.clear();
        return;
    }
    readerDiv.classList.remove('hidden');
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    html5QrcodeScanner.render((decodedText) => {
        document.getElementById('site-password').value = decodedText;
        html5QrcodeScanner.clear();
        readerDiv.classList.add('hidden');
        checkSitePassword();
    }, (error) => {});
}

// 4. Initialize Dashboard
function initializeDashboard() {
    document.getElementById('greeting').textContent = `Hello, ${configData.user.name}!`;
    document.getElementById('current-plan-display').textContent = `Current: ${configData.user.currentPlan}`;

    const container = document.getElementById('plans-container');
    container.innerHTML = '';
    
    configData.plans.forEach(plan => {
        if (plan.name === configData.user.currentPlan) return; 
        const div = document.createElement('div');
        div.className = 'border rounded-xl p-4 hover:border-blue-500 transition cursor-pointer flex justify-between items-center group bg-gray-50';
        div.innerHTML = `
            <div>
                <h3 class="font-bold text-gray-900">${plan.name}</h3>
                <p class="text-sm text-gray-500">${plan.price}</p>
            </div>
            <button onclick="initiateSwitch('${plan.name}')" class="text-blue-600 font-bold bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition">Select</button>
        `;
        container.appendChild(div);
    });
}

// 5. Plan Switching
function initiateSwitch(planName) {
    pendingPlan = configData.plans.find(p => p.name === planName);
    document.getElementById('modal-plan-details').innerHTML = `<strong>${pendingPlan.name}</strong><br>${pendingPlan.price}<br><span class='text-xs'>${pendingPlan.benefits}</span>`;
    document.getElementById('confirm-password').value = '';
    document.getElementById('modal-error').textContent = '';
    document.getElementById('password-modal').classList.remove('hidden');
    document.getElementById('password-modal').classList.add('flex');
}

function closeModal() {
    document.getElementById('password-modal').classList.add('hidden');
    document.getElementById('password-modal').classList.remove('flex');
}

async function confirmSwitch() {
    const input = document.getElementById('confirm-password').value;
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: input })
        });
        const result = await response.json();

        if (result.success) {
            const email = "dg8ab@icloud.com";
            const subject = `CloudZero: Switch to ${pendingPlan.name}`;
            const body = `I want to switch to the ${pendingPlan.name} plan.\nPrice: ${pendingPlan.price}`;
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            closeModal();
        } else {
            document.getElementById('modal-error').textContent = "Incorrect password.";
        }
    } catch (e) { document.getElementById('modal-error').textContent = "Server error."; }
}

// 6. Meeting Form
document.getElementById("meeting-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const status = document.getElementById("form-message");
    const data = new FormData(event.target);
    fetch("https://formspree.io/f/xbdlnbbg", {
        method: "POST", body: data, headers: { 'Accept': 'application/json' }
    }).then(res => {
        if (res.ok) { status.innerHTML = "Meeting request sent!"; event.target.reset(); }
        else status.innerHTML = "Error sending request.";
    });
});

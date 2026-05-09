const editor = document.getElementById('editor');
const saveBtn = document.getElementById('save-btn');
const configBtn = document.getElementById('config-btn');
const modal = document.getElementById('modal');
const statusLight = document.getElementById('status-light');
const syncStatus = document.getElementById('sync-status');
const chipContainer = document.getElementById('chip-container');

let GITHUB_TOKEN = localStorage.getItem('pet_token');
let GITHUB_REPO = localStorage.getItem('pet_repo');
let FILE_SHA = null;
let allNotes = []; 
let activeIndex = null; // Tracks if we are editing an existing chip

// Initialize
if (!GITHUB_TOKEN) {
    modal.classList.remove('hidden');
} else {
    loadData();
}

configBtn.addEventListener('click', () => modal.classList.toggle('hidden'));

document.getElementById('setup-confirm').addEventListener('click', () => {
    localStorage.setItem('pet_token', document.getElementById('gh-token').value);
    localStorage.setItem('pet_repo', document.getElementById('gh-repo').value);
    location.reload();
});

// --- LOAD DATA ---
async function loadData() {
    syncStatus.innerText = "JACKING IN...";
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/vault.json`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });

        if (res.status === 404) {
            syncStatus.innerText = "NEW VAULT CREATED";
            allNotes = [];
            renderChips();
            return;
        }

        const data = await res.json();
        FILE_SHA = data.sha;
        
        // Robust UTF-8 Decoding
        const content = JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\s/g, '')))));
        allNotes = content.notes || [];
        
        renderChips();
        statusLight.className = "online";
        syncStatus.innerText = "LINK ESTABLISHED";
    } catch (e) {
        console.error(e);
        syncStatus.innerText = "NO DATA FOUND";
        statusLight.className = "offline";
    }
}

// --- RENDER CHIPS ---
function renderChips() {
    chipContainer.innerHTML = "";
    
    // Add a "+" chip for creating new notes
    const newBtn = document.createElement('div');
    newBtn.className = "chip new-chip";
    newBtn.innerText = "[+] NEW LOG";
    newBtn.onclick = () => {
        activeIndex = null;
        editor.innerHTML = "";
        editor.focus();
    };
    chipContainer.appendChild(newBtn);

    allNotes.forEach((note, index) => {
        const chip = document.createElement('div');
        chip.className = `chip ${activeIndex === index ? 'active' : ''}`;
        chip.innerText = note.title || `LOG_${index}`;
        
        chip.onclick = () => {
            activeIndex = index;
            editor.innerHTML = note.body;
            renderChips(); // Refresh styles
        };
        chipContainer.appendChild(chip);
    });
}

// --- SAVE DATA ---
saveBtn.addEventListener('click', async () => {
    if (!editor.innerText.trim() && !editor.innerHTML.includes('<img')) {
        syncStatus.innerText = "VOID DATA REJECTED";
        return;
    }

    syncStatus.innerText = "UPLOADING...";

    const currentNote = {
        title: editor.innerText.substring(0, 15).toUpperCase() || "UNTITLED LOG",
        body: editor.innerHTML,
        date: new Date().toLocaleString()
    };

    if (activeIndex !== null) {
        allNotes[activeIndex] = currentNote; // Update existing
    } else {
        allNotes.push(currentNote); // Add new
    }

    try {
        // Robust UTF-8 Encoding
        const content = btoa(unescape(encodeURIComponent(JSON.stringify({ notes: allNotes }))));
        
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/vault.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "PET Terminal Sync",
                content: content,
                sha: FILE_SHA
            })
        });

        if (res.ok) {
            const data = await res.json();
            FILE_SHA = data.content.sha;
            syncStatus.innerText = "UPLOAD COMPLETE";
            renderChips();
        } else {
            syncStatus.innerText = "UPLOAD FAILED";
        }
    } catch (e) {
        syncStatus.innerText = "CONNECTION ERROR";
    }
});
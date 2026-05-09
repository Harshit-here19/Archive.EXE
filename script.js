const editor = document.getElementById('editor');
const saveBtn = document.getElementById('save-btn');
const configBtn = document.getElementById('config-btn');
const modal = document.getElementById('modal');
const statusLight = document.getElementById('status-light');
const syncStatus = document.getElementById('sync-status');

let GITHUB_TOKEN = localStorage.getItem('pet_token');
let GITHUB_REPO = localStorage.getItem('pet_repo');
let FILE_SHA = null;

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

async function loadData() {
    syncStatus.innerText = "JACKING IN...";
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/vault.json`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const data = await res.json();
        FILE_SHA = data.sha;
        const content = JSON.parse(atob(data.content));
        editor.innerHTML = content.body;
        statusLight.className = "online";
        syncStatus.innerText = "LINK ESTABLISHED";
    } catch (e) {
        syncStatus.innerText = "NO DATA FOUND";
        statusLight.className = "offline";
    }
}

saveBtn.addEventListener('click', async () => {
    syncStatus.innerText = "UPLOADING...";
    const content = btoa(JSON.stringify({ body: editor.innerHTML }));
    
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/vault.json`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: "PET Sync Update",
            content: content,
            sha: FILE_SHA
        })
    });

    if (res.ok) {
        const data = await res.json();
        FILE_SHA = data.content.sha;
        syncStatus.innerText = "UPLOAD COMPLETE";
    } else {
        syncStatus.innerText = "UPLOAD FAILED";
    }
});
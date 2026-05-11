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

const CHIP_ICONS = [
    "⚔️", // sword
    "🔥", // fire
    "💊", // heal
    "❄️", // ice
    "⚡", // thunder
    "💥", // cannon
    "🛡️", // shield
    "🧠", // support / nav
    "💾", // default data
    "☠️"  // dark chip
];



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

function getChipMeta(title = "") {
    const ICONS = ["⚔️", "🔥", "💊", "❄️", "⚡", "💥", "🛡️", "🧠", "💾", "☠️"];
    const ELEMENTS = ["fire", "aqua", "elec", "neutral", "fire", "aqua", "elec"];

    let hash = 0;

    for (let i = 0; i < title.length; i++) {
        hash = (hash * 33 + title.charCodeAt(i)) >>> 0;
    }

    const icon = ICONS[hash % ICONS.length];

    // 🔥 better spread (no bit shifting collapse)
    const elementIndex = Math.floor((hash % 1000) / 250);
    const element = ELEMENTS[elementIndex];

    return { icon, element };
}

// --- RENDER CHIPS ---
function renderChips() {
    chipContainer.innerHTML = "";

    // NEW CHIP
    const newBtn = document.createElement('div');
    newBtn.className = "chip new-chip";

    const meta = getChipMeta("+ NEW LOG");

    newBtn.className = `chip ${meta.element} new-chip`;

    newBtn.innerHTML = `
    <div class="chip-top">
        <span class="chip-title-text">+ NEW LOG</span>
    </div>

    <div class="chip-art">
        <span class="chip-icon">${meta.icon}</span>
    </div>

    <div class="chip-bottom"></div>
`;

    newBtn.onclick = () => {
        activeIndex = null;
        editor.innerHTML = "";
        requestAnimationFrame(() => renderChips());
    };

    newBtn.style.animation = "chipInsert 0.25s ease-out";

    chipContainer.appendChild(newBtn);

    // NOTES
    allNotes.forEach((note, index) => {

        const chip = document.createElement('div');

        const meta = getChipMeta(note.title || "");

        const element = meta?.element || "neutral";
        const icon = meta?.icon || "💾";

        const isActive = index === activeIndex;

        chip.className = `chip ${element} ${isActive ? 'active' : ''}`;

        chip.innerHTML = `
        <div class="chip-top">
            <span class="chip-title-text">
                ${note.title || `LOG_${index}`}
            </span>
        </div>

        <div class="chip-art">
            <span class="chip-icon">
                ${icon}
            </span>
        </div>

        <div class="chip-bottom"></div>
    `;
        const delay = Math.random() * 2; // 0–2s stagger

        chip.style.setProperty("--scan-delay", `${delay}s`);

        chip.style.animation =
            "chipInsert 0.35s cubic-bezier(0.2, 1, 0.2, 1)";

        chip.onclick = () => {
            activeIndex = index;
            editor.innerHTML = note.body || "";

            // remove previous locks
            document.querySelectorAll(".chip.locked")
                .forEach(c => c.classList.remove("locked"));

            // lock current chip
            chip.classList.add("locked");

            chip.style.animation = "chipLock 0.35s ease-out";

            renderChips();
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
        title: editor.innerText
            .trim()
            .split('\n')[0]
            .substring(0, 22)
            .toUpperCase() || "UNTITLED LOG",
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
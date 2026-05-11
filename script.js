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
let activeId = null; // Tracks if we are editing an existing chip

let draggedChip = null;

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

async function syncToGitHub() {

    syncStatus.innerText = "UPLOADING...";

    const content = btoa(
        unescape(
            encodeURIComponent(
                JSON.stringify({ notes: allNotes })
            )
        )
    );

    const res = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/vault.json`,
        {
            method: "PUT",
            headers: {
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "PET Sync Update",
                content,
                sha: FILE_SHA
            })
        }
    );

    if (res.ok) {
        const data = await res.json();
        FILE_SHA = data.content.sha;
        syncStatus.innerText = "SYNC OK";
    } else {
        syncStatus.innerText = "SYNC FAILED";
    }
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
        activeId = null;
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

        const isActive = note.id === activeId;

        chip.className = `chip ${element} ${isActive ? 'active' : ''}`;
        // chip.dataset.index = index; // ✅ IMPORTANT FIX
        chip.dataset.id = note.id;

        chip.innerHTML = `
    <div class="chip-top">
        <span class="chip-title-text">
            ${note.title || `LOG_${index}`}
        </span>

        <button class="chip-delete" title="Delete">✕</button>
    </div>

    <div class="chip-art">
        <span class="chip-icon">
            ${meta.icon}
        </span>
    </div>

    <div class="chip-bottom"></div>
`;

        const delay = Math.random() * 2; // 0–2s stagger

        chip.style.setProperty("--scan-delay", `${delay}s`);

        chip.style.animation =
            "chipInsert 0.35s cubic-bezier(0.2, 1, 0.2, 1)";

        // ✅ DELETE BUTTON EVENT (MUST BE HERE)
        chip.querySelector(".chip-delete").onclick = async (e) => {
            playSound("corrupt");
            e.stopPropagation();

            const id = note.id;

            const ok = await confirmDeleteChip();
            if (!ok) return;

            chip.style.animation = "chipBreak 0.25s ease forwards";

            setTimeout(async () => {

                allNotes = allNotes.filter(n => n.id !== id);

                if (activeId === id) {
                    activeId = null;
                    editor.innerHTML = "";
                }

                renderChips();

                // 🔥 CRITICAL: Update GitHub after deleting
                await syncToGitHub();

            }, 200);

            playSound("delete");
        };

        chip.draggable = true;

        chip.addEventListener("dragstart", (e) => {
            draggedChip = chip;
            // Set dataTransfer to ensure some browsers don't cancel the drag
            e.dataTransfer.setData("text/plain", note.id);
        });

        chip.onclick = () => {
            activeId = note.id;
            playSound("select");
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

    // 🔥 FIX: Use existing ID if activeId exists, otherwise generate new
    const currentNote = {
        id: activeId ? activeId : generateUUID(), 
        title: editor.innerText.trim().split('\n')[0].substring(0, 22).toUpperCase() || "UNTITLED LOG",
        body: editor.innerHTML,
        date: new Date().toLocaleString()
    };

    const i = allNotes.findIndex(n => n.id === activeId);

    if (i !== -1) {
        allNotes[i] = currentNote;
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

const trash = document.getElementById("trash-slot");

let magnetChip = null;

trash.addEventListener("dragover", (e) => {
    e.preventDefault();

    if (!draggedChip) return;

    const dist = getDistance(draggedChip, trash);

    if (dist < 180) {

        trash.classList.add("active");

        draggedChip.style.transform = "scale(0.9)";
        draggedChip.style.filter = "brightness(1.5) drop-shadow(0 0 10px red)";

    } else {

        trash.classList.remove("active");

        draggedChip.style.transform = "scale(1)";
        draggedChip.style.filter = "none";
    }
});

trash.addEventListener("dragleave", () => {
    trash.classList.remove("active");

    if (magnetChip) {
        magnetChip.style.transform = "scale(1)";
        magnetChip.style.filter = "none";
        magnetChip = null;
    }
});

trash.addEventListener("drop", async (e) => {
    e.preventDefault();
    trash.classList.remove("active");

    if (!draggedChip) return;
    const id = draggedChip.dataset.id;

    // Optional: If you want to keep the distance check, keep it, 
    // but usually 'drop' only fires if the mouse is OVER the element.
    const ok = await confirmDeleteChip();
    if (!ok) {
        resetChip(draggedChip);
        return;
    }

    draggedChip.style.animation = "chipCorrupt 0.4s forwards";

    setTimeout(async () => {
        allNotes = allNotes.filter(n => n.id !== id);
        
        if (activeId === id) {
            activeId = null;
            editor.innerHTML = "";
        }

        renderChips();
        await syncToGitHub(); // 🔥 Syncs to GitHub
        draggedChip = null;
    }, 1000);
});

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    let freq = 440;
    let duration = 0.1;

    switch (type) {

        case "save":
            freq = 880;
            duration = 0.12;
            break;

        case "delete":
            freq = 180;
            duration = 0.2;
            break;

        case "select":
            freq = 520;
            duration = 0.08;
            break;

        case "corrupt":
            freq = 90;
            duration = 0.3;
            break;

        case "drop":
            freq = 300;
            duration = 0.15;
            break;
    }

    osc.frequency.value = freq;
    osc.type = "square";

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function confirmDeleteChip() {
    return new Promise((resolve) => {

        const modal = document.getElementById("confirm-modal");
        const yes = document.getElementById("confirm-yes");
        const no = document.getElementById("confirm-no");

        modal.classList.remove("hidden");

        yes.onclick = () => {
            modal.classList.add("hidden");
            resolve(true);
        };

        no.onclick = () => {
            modal.classList.add("hidden");
            resolve(false);
        };
    });
}

function getDistance(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();

    const dx = (r1.left + r1.width / 2) - (r2.left + r2.width / 2);
    const dy = (r1.top + r1.height / 2) - (r2.top + r2.height / 2);

    return Math.sqrt(dx * dx + dy * dy);
}

function generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function resetChip(chip) {
    chip.style.transform = "scale(1)";
    chip.style.filter = "none";
}
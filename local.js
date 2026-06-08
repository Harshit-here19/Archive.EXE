const DB_NAME = "PET_LOCAL_VAULTS";
const STORE_NAME = "vaults";

async function openDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (e) => {

            const db = e.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {

                db.createObjectStore(STORE_NAME, {
                    keyPath: "username"
                });
            }
        };

        request.onsuccess = () =>
            resolve(request.result);

        request.onerror = () =>
            reject(request.error);
    });
}

async function hashPassword(password) {

    const data =
        new TextEncoder().encode(password);

    const hash =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    return Array
        .from(new Uint8Array(hash))
        .map(b =>
            b.toString(16)
                .padStart(2, "0")
        )
        .join("");
}

async function getVault(username) {

    const db = await openDB();

    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(STORE_NAME, "readonly");

        const store =
            tx.objectStore(STORE_NAME);

        const req = store.get(username);

        req.onsuccess = () =>
            resolve(req.result);

        req.onerror = () =>
            reject(req.error);
    });
}

async function saveVault(vault) {

    const db = await openDB();

    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(STORE_NAME, "readwrite");

        const store =
            tx.objectStore(STORE_NAME);

        const req =
            store.put(vault);

        req.onsuccess = () =>
            resolve(true);

        req.onerror = () =>
            reject(req.error);
    });
}

window.loginLocal = async function (
    username,
    password
) {

    const passwordHash =
        await hashPassword(password);

    let vault =
        await getVault(username);

    if (!vault) {

        vault = {
            username,
            passwordHash,
            notes: []
        };

        await saveVault(vault);

        localStorage.setItem(
            "pet_local_user",
            username
        );

        localStorage.setItem(
            "pet_local_pass",
            passwordHash
        );

        return {
            success: true,
            created: true
        };
    }

    if (
        vault.passwordHash !== passwordHash
    ) {

        return {
            success: false,
            message: "INVALID PASSWORD"
        };
    }

    localStorage.setItem(
        "pet_local_user",
        username
    );

    localStorage.setItem(
        "pet_local_pass",
        passwordHash
    );

    return {
        success: true,
        created: false
    };
};

window.loadLocalData =
    async function () {

        const username =
            localStorage.getItem(
                "pet_local_user"
            );

        if (!username)
            return [];

        const vault =
            await getVault(username);

        return vault?.notes || [];
    };

window.saveLocalData =
    async function (notes) {

        const username =
            localStorage.getItem(
                "pet_local_user"
            );

        if (!username)
            return;

        const vault =
            await getVault(username);

        if (!vault)
            return;

        vault.notes = notes;

        await saveVault(vault);
    };

window.logoutLocal =
    function () {

        localStorage.removeItem(
            "pet_local_user"
        );

        localStorage.removeItem(
            "pet_local_pass"
        );
    };
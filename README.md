
# 📟 Archive.EXE | PET v3.0 

**Deployment Status**: 🟢 Online

**Direct Link**: https://harshit-here19.github.io/Archive.EXE/

**Personal Terminal (PET)** is a cyber-styled, decentralized note-taking interface inspired by the _MegaMan Battle Network_ series. It transforms your notes into "Battle Chips," using a private GitHub repository as your persistent, encrypted-on-the-fly storage vault.

----------

## ✨ Features

-   **Battle Chip UI**: Every note is rendered as a unique Battle Chip with procedurally generated icons and elemental themes (Fire, Aqua, Elec, Wood).
    
-   **GitHub-Backed Storage**: No database required. Your data is stored in your own repository as `vault.json`.
    
-   **Jack-In Authentication**: Securely connect using your GitHub Personal Access Token (PAT).
    
-   **Search System**: Quickly filter through your Chip Deck to find specific logs by title or content.
    
-   **Themed Interactions**:
    
    -   **Upload Data**: Sync your logs directly to the cloud.
        
    -   **Trash Slot**: Drag and drop chips into the bin to delete them with a "corruption" animation.
        
    -   **Sound Effects**: 8-bit oscillator-based audio feedback for saving, selecting, and deleting.
        
-   **Security & Logout**: Instantly terminate the session and clear local credentials using the emergency logout.
    

----------

## 🚀 Getting Started

### 1. Prerequisites

You need a GitHub account and a repository to act as your "Vault."

1.  Create a **Private** repository on GitHub (e.g., `my-vault`).
    
2.  Generate a **GitHub Personal Access Token (classic)** with `repo` scope.
    

### 2. Installation

1.  Clone the repository:
    
    Bash
    
    ```
    git clone https://github.com/Harshit-here19/Archive.EXE.git
    
    ```
    
2.  Open `index.html` in your browser.
    

### 3. Connection (Jacking In)

-   When prompted by the **Modal**, enter your **GitHub Token** and the path to your repository (`username/repo-name`).
    
-   Click **INITIALIZE**.
    
-   The terminal will attempt to "Jack In" and fetch `vault.json`.
    

----------

## 🕹️ Controls & Navigation

### **The Header**

-   **🔴 Logout Button**: Located at the top left (the red circle before the PET logo). Clicking this will wipe your local session and return you to the login screen.
    
-   **Status Light**: Indicates if you are currently `ONLINE` (linked to GitHub) or `OFFLINE`.
    

### **The Chip Deck**

-   **Search Bar**: Use the search input to filter your chips in real-time. Only chips matching your query will remain visible in the deck.
    
-   **+ NEW LOG**: Creates a fresh data entry.
    
-   **DRAG TO TRASH**: To delete a chip, drag it toward the bottom-right trash slot until it glows red, then drop.
    

----------

## 🎮 Technical Breakdown

-   **Logic**: Pure Vanilla JavaScript (ES6+).
    
-   **Storage**: GitHub REST API (PUT/GET).
    
-   **Audio**: Web Audio API (Live-generated square waves).
    
-   **Encoding**: Robust UTF-8 Base64 encoding to ensure special characters and emojis in your notes don't break the JSON sync.
    

----------

## 🛠️ Configuration

If you need to change your vault settings without logging out, click the **CONFIG** button in the footer to modify your Token or Repository path.

> **Privacy Warning:** Your token is stored locally in `localStorage`. Ensure you are using a trusted machine, or use the **Red Logout Circle** to clear your credentials after your session.

----------

### 📜 License

MIT License. Feel free to fork and customize your own PET.

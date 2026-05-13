
# 📟 Archive.EXE | PET v4.0

**Personal Terminal (PET)** is a cyber-styled, decentralized note-taking interface inspired by the _MegaMan Battle Network_ series. It transforms your notes into "Battle Chips," using a private GitHub repository as your persistent, encrypted-on-the-fly storage vault.

----------

## ✨ Features

-   **Battle Chip UI**: Every note is rendered as a unique Battle Chip with procedurally generated icons and elemental themes (Fire, Aqua, Elec, Wood).
    
-   **GitHub-Backed Storage**: No database required. Your data is stored in your own repository as `vault.json`.
    
-   **Jack-In Authentication**: Securely connect using your GitHub Personal Access Token (PAT).
    
-   **Search System**: Quickly filter through your Chip Deck to find specific logs.
    
-   **Themed Interactions**:
    
    -   **Upload Data**: Sync your logs directly to the cloud.
        
    -   **Trash Slot**: Drag and drop chips to delete them with a "corruption" animation.
        
    -   **Sound Effects**: 8-bit oscillator-based audio feedback.
        
-   **Security**: Instantly terminate the session and clear local credentials using the emergency logout.
    

----------

## 🚀 Getting Started

### 1. Prerequisites

1.  Create a **Private** repository on GitHub (e.g., `my-vault`).
    
2.  Generate a **GitHub Personal Access Token (classic)** with `repo` scope.
    

### 2. Installation

1.  Clone the repository:
    
    Bash
    
    ```
    git clone https://github.com/Harshit-here19/Archive.EXE.git
    
    ```
    
2.  Open `index.html` in any modern web browser.
    

### 3. Connection (Jacking In)

-   Enter your **GitHub Token** and the path (`username/repo-name`) in the login modal.
    
-   Click **INITIALIZE** to fetch your `vault.json`.
    

----------

## 🕹️ Controls & Navigation

### **The Header**

-   🔴 **Logout**: The red circle wipes your local session immediately.
    
-   **Status Light**: Indicates if you are `ONLINE` (linked) or `OFFLINE`.
    

### **The Chip Deck**

-   **Search Bar**: Filters chips in real-time.
    
-   **+ NEW LOG**: Creates a fresh data entry.
    
-   **DRAG TO TRASH**: Drag a chip to the bottom-right slot until it glows red to delete.
    

### **⌨️ Keyboard Shortcuts (Advanced)**

The PET interface supports terminal-style shortcuts for data formatting:

**Shortcut** - `Ctrl + Shift + Y`

**Action** - **2-Column Split**

**Description** - Quickly formats highlighted text into a two-column grid separated by `:`.

----------

## 🎮 Technical Breakdown

-   **Logic**: Pure Vanilla JavaScript (ES6+).
    
-   **Storage**: GitHub REST API (PUT/GET).
    
-   **Audio**: Web Audio API (Live-generated square waves).
    
-   **Encoding**: Robust UTF-8 Base64 encoding for emoji and special character support.
    

----------

## 🛠️ Configuration

Need to update your credentials? Click the **CONFIG** button in the footer to modify your Token or Repository path without jacking out.

> **Privacy Warning:** Your token is stored in `localStorage`. Always use the **Red Logout Circle** to wipe credentials if using a shared machine.

----------

### 📜 License

MIT License. Feel free to fork and customize your own PET.
// ========================================
// ASCII TABLE SHORTCUT FOR CONTENTEDITABLE
// CTRL + SHIFT + Y
// ========================================

(function () {

    const editor = document.getElementById("editor");

    // ---------------------------
    // GENERATE TABLE
    // ---------------------------
    function generateTable(rows) {

        const col1Width = Math.max(
            ...rows.map(r => r[0].length)
        );

        const col2Width = Math.max(
            ...rows.map(r => r[1].length)
        );

        const line = (char = "-") =>
            `+${char.repeat(col1Width + 2)}+${char.repeat(col2Width + 2)}+`;

        const row = (a, b) =>
            `| ${a.padEnd(col1Width)} | ${b.padEnd(col2Width)} |`;

        let output = "";

        output += line("-") + "\n";

        // FIRST ROW = HEADER
        output += row(rows[0][0], rows[0][1]) + "\n";

        output += line("=") + "\n";

        // REST = BODY
        for (let i = 1; i < rows.length; i++) {
            output += row(rows[i][0], rows[i][1]) + "\n";
        }

        output += line("-");

        return output;
    }

    // ---------------------------
    // PARSE TEXT
    // ---------------------------
    function parseSelection(text) {

        const lines = text
            .split("\n")
            .map(l => l.trim())
            .filter(Boolean);

        const rows = [];

        for (const line of lines) {

            const match = line.match(/^(.+?)\s*[:=-]\s*(.+)$/);

            if (match) {

                rows.push([
                    match[1].trim(),
                    match[2].trim()
                ]);
            }
        }

        return rows;
    }

    // ---------------------------
    // REPLACE SELECTED CONTENT
    // ---------------------------
    function replaceSelectedText(tableText) {

        const selection = window.getSelection();

        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // DELETE CURRENT SELECTION
        range.deleteContents();

        // INSERT PRE BLOCK
        // INSERT TABLE BLOCK
        const pre = document.createElement("pre");

        pre.textContent = tableText;

        // inherit editor styling
        pre.style.margin = "10px 0";
        pre.style.whiteSpace = "pre-wrap";

        pre.style.fontFamily = "inherit";
        pre.style.fontSize = "inherit";
        pre.style.color = "inherit";

        pre.style.fontWeight = "bold";

        // optional: preserve editor spacing
        pre.style.lineHeight = "inherit";

        range.insertNode(pre);

        // MOVE CARET AFTER PRE
        range.setStartAfter(pre);
        range.setEndAfter(pre);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    // ---------------------------
    // SHORTCUT
    // CTRL + SHIFT + Y
    // ---------------------------
    document.addEventListener("keydown", (e) => {

        if (
            e.ctrlKey &&
            e.shiftKey &&
            e.key.toLowerCase() === "y"
        ) {

            // console.log("Shortcut Triggered");

            e.preventDefault();

            const selection = window.getSelection();

            const text = selection.toString().trim();

            if (!text) {
                console.log("No text selected");
                return;
            }

            const rows = parseSelection(text);

            if (!rows.length) {
                console.log("Invalid format");
                return;
            }

            const table = generateTable(rows);

            replaceSelectedText(table);
        }
    });

})();
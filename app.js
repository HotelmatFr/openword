const editor = document.getElementById("editor");
const wordCountSpan = document.getElementById("wordCount");
const autosaveStatus = document.getElementById("autosaveStatus");
const fileMenu = document.getElementById("fileMenu");

/* ------------------------------
   COMMANDES DE FORMATAGE
--------------------------------*/
function exec(command) {
    document.execCommand(command, false, null);
    refreshEditorState();
}

/* Police */
function changeFont() {
    const font = document.getElementById("fontSelect").value;
    document.execCommand("fontName", false, font);
    scheduleAutosave();
}

/* Taille */
function changeSize() {
    const size = document.getElementById("sizeSelect").value;
    document.execCommand("fontSize", false, size);
    scheduleAutosave();
}

/* Couleur texte */
function changeColor() {
    const color = document.getElementById("colorPicker").value;
    document.execCommand("foreColor", false, color);
    scheduleAutosave();
}

/* Surlignage */
function changeHighlight() {
    const color = document.getElementById("highlightPicker").value;
    document.execCommand("hiliteColor", false, color);
    scheduleAutosave();
}

/* ------------------------------
   PLACEHOLDER
--------------------------------*/
function updatePlaceholder() {
    const empty = editor.innerText.trim() === "";
    editor.classList.toggle("empty", empty);
}

/* ------------------------------
   COMPTEUR DE MOTS
--------------------------------*/
function updateWordCount() {
    const text = editor.innerText.trim();
    if (text === "") {
        wordCountSpan.textContent = "0 mots";
        return;
    }
    const words = text.split(/\s+/).filter(w => w.length > 0);
    wordCountSpan.textContent = words.length + (words.length > 1 ? " mots" : " mot");
}

/* ------------------------------
   INSERTION D’IMAGE
--------------------------------*/
function insertImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "100%";
        img.style.display = "block";
        img.style.margin = "10px 0";

        const selection = window.getSelection();
        if (!selection.rangeCount) {
            editor.appendChild(img);
        } else {
            const range = selection.getRangeAt(0);
            range.insertNode(img);
        }

        refreshEditorState();
    };
    reader.readAsDataURL(file);
}

/* ------------------------------
   ONGLET DU RUBAN
--------------------------------*/
function switchTab(tabName) {
    document.querySelectorAll(".tab").forEach(t => {
        t.classList.toggle("active", t.dataset.tab === tabName);
    });

    document.querySelectorAll(".toolbar-section").forEach(section => {
        section.classList.add("hidden");
    });

    const target = document.getElementById(`toolbar-${tabName}`);
    if (target) target.classList.remove("hidden");

    closeFileMenu();
}

/* ------------------------------
   MODE SOMBRE
--------------------------------*/
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

/* ------------------------------
   AUTOSAVE
--------------------------------*/
let autosaveTimeout = null;

function scheduleAutosave() {
    autosaveStatus.textContent = "Enregistrement...";
    if (autosaveTimeout) clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(autosave, 600);
}

function autosave() {
    localStorage.setItem("monWordDocument", editor.innerHTML);
    autosaveStatus.textContent = "Enregistré";
}

/* ------------------------------
   CHARGEMENT INITIAL
--------------------------------*/
function loadDocument() {
    const saved = localStorage.getItem("monWordDocument");
    if (saved) editor.innerHTML = saved;

    refreshEditorState();
}

/* ------------------------------
   EXPORT PDF
--------------------------------*/
function exportPDF() {
    window.print();
}

/* ------------------------------
   MENU FICHIER
--------------------------------*/
function openFileMenu() {
    fileMenu.classList.add("visible");
}

function closeFileMenu() {
    fileMenu.classList.remove("visible");
}

/* Fermer le menu si on clique ailleurs */
document.addEventListener("click", (e) => {
    const clickedInsideMenu = fileMenu.contains(e.target);
    const clickedFileButton = e.target.closest("#fileTab");

    if (!clickedInsideMenu && !clickedFileButton) {
        closeFileMenu();
    }
});

/* ------------------------------
   NOUVEAU DOCUMENT
--------------------------------*/
function newDocument() {
    if (confirm("Créer un nouveau document ? Le contenu actuel sera perdu.")) {
        editor.innerHTML = "";
        refreshEditorState();
    }
}

/* ------------------------------
   OUVRIR UN FICHIER
--------------------------------*/
function openDocument() {
    document.getElementById("openFileInput").click();
}

function loadOpenedFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        editor.innerHTML = e.target.result;
        refreshEditorState();
    };
    reader.readAsText(file);
}

/* ------------------------------
   ENREGISTRER
--------------------------------*/
function saveDocument() {
    const content = editor.innerHTML;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
}

function saveAsDocument() {
    saveDocument();
}

/* ------------------------------
   UTILITAIRE GLOBAL
--------------------------------*/
function refreshEditorState() {
    updatePlaceholder();
    updateWordCount();
    scheduleAutosave();
}

/* ------------------------------
   ÉVÉNEMENTS
--------------------------------*/
editor.addEventListener("input", refreshEditorState);
editor.addEventListener("focus", updatePlaceholder);
editor.addEventListener("blur", updatePlaceholder);

/* ------------------------------
   INIT
--------------------------------*/
loadDocument();

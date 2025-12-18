const editor = document.getElementById("editor");
const wordsEl = document.getElementById("words");

/* =========================
   ENSURE EDITOR IS NEVER EMPTY
========================= */
function ensureContent() {
  if (!editor.innerHTML.trim()) {
    editor.innerHTML = "<p><br></p>";
  }
}
ensureContent();

/* =========================
   PREVENT TOOLBAR SELECTION LOSS
========================= */
document.querySelectorAll(".ribbon button").forEach(btn => {
  btn.addEventListener("mousedown", e => e.preventDefault());
});

/* =========================
   BASIC COMMANDS
========================= */
document.querySelectorAll("[data-cmd]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.execCommand(btn.dataset.cmd);
    editor.focus();
    updateToolbar();
  });
});

/* =========================
   FONT / SIZE / COLOR
========================= */
font.onchange = () => {
  document.execCommand("fontName", false, font.value);
  editor.focus();
};

size.onchange = () => {
  document.execCommand("fontSize", false, size.value);
  editor.focus();
};

color.onchange = () => {
  document.execCommand("foreColor", false, color.value);
  editor.focus();
};

/* =========================
   CLEAN ENTER (PARAGRAPHS)
========================= */
editor.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.execCommand("insertHTML", false, "<p><br></p>");
  }
});

/* =========================
   WORD COUNT + AUTOSAVE
========================= */
editor.addEventListener("input", () => {
  ensureContent();

  const text = editor.innerText.trim();
  wordsEl.textContent = text ? text.split(/\s+/).length : 0;

  // only autosave meaningful content
  if (text.length > 0) {
    localStorage.setItem("autosave", editor.innerHTML);
  }

  updateToolbar();
});

/* =========================
   TOOLBAR ACTIVE STATE
========================= */
function updateToolbar() {
  document.querySelectorAll("[data-cmd]").forEach(btn => {
    try {
      btn.classList.toggle(
        "active",
        document.queryCommandState(btn.dataset.cmd)
      );
    } catch {}
  });
}

document.addEventListener("selectionchange", updateToolbar);

/* =========================================================
   ✅ FIXED FEATURES START HERE
========================================================= */

/* =========================
   CLEAR (FULL RESET, WORD-LIKE)
========================= */
clear.onclick = () => {
  editor.innerHTML = "<p><br></p>";
  localStorage.removeItem("autosave");
  editor.focus();
  updateToolbar();
};

/* =========================
   PAGE BREAK (CARET SAFE)
========================= */
pageBreak.onclick = () => {
  document.execCommand(
    "insertHTML",
    false,
    '<div class="page-break"></div><p><br></p>'
  );
  editor.focus();
};

/* =========================
   SAVE (SAFE)
========================= */
save.onclick = () => {
  ensureContent();
  localStorage.setItem("doc", editor.innerHTML);
};

/* =========================
   LOAD (SAFE, NON-DESTRUCTIVE)
========================= */
load.onclick = () => {
  const saved =
    localStorage.getItem("doc") ||
    localStorage.getItem("autosave");

  editor.innerHTML = saved && saved.trim()
    ? saved
    : "<p><br></p>";

  ensureContent();
  editor.focus();
};

/* =========================
   PRINT (WORD-LIKE)
========================= */
print.onclick = () => {
  ensureContent();
  window.print();
};

/* =========================
   KEYBOARD SHORTCUTS
========================= */
document.addEventListener("keydown", e => {
  if (!e.ctrlKey) return;

  const map = {
    b: "bold",
    i: "italic",
    u: "underline"
  };

  if (map[e.key]) {
    e.preventDefault();
    document.execCommand(map[e.key]);
    updateToolbar();
  }
});

/* =========================
   RESTORE AUTOSAVE ON LOAD
========================= */
window.onload = () => {
  const saved = localStorage.getItem("autosave");
  if (saved && saved.trim()) {
    editor.innerHTML = saved;
  }
  ensureContent();
};

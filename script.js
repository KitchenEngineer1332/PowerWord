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

const statusMsg = document.getElementById("statusMsg");

/* =========================
   STATUS HELPER
========================= */
function setStatus(msg) {
  statusMsg.textContent = msg;
  setTimeout(() => (statusMsg.textContent = "Ready"), 2000);
}

/* =========================
   SAVE (NON-BLOCKING)
========================= */
save.onclick = () => {
  ensureContent();

  const html = editor.innerHTML.trim();
  if (!html || html === "<p><br></p>") {
    setStatus("Nothing to save");
    return;
  }

  localStorage.setItem("doc", html);
  setStatus("Document saved");
};

/* =========================
   LOAD (SAFE)
========================= */
load.onclick = () => {
  const savedDoc = localStorage.getItem("doc");

  if (savedDoc && savedDoc.trim()) {
    editor.innerHTML = savedDoc;
    setStatus("Document loaded");
  } else {
    setStatus("No saved document");
    return;
  }

  ensureContent();
  editor.focus();
};

/* =========================
   PRINT (GUARANTEED CONTENT)
========================= */
print.onclick = () => {
  ensureContent();

  if (editor.innerText.trim().length === 0) {
    editor.innerHTML = "<p><br></p>";
  }

  setStatus("Preparing print…");
  setTimeout(() => window.print(), 50);
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

darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "dark",
    document.body.classList.contains("dark")
  );
};

if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "f") {
    e.preventDefault();
    findBox.hidden = !findBox.hidden;
  }
});

findBtn.onclick = () => {
  const q = findText.value;
  if (!q) return;

  editor.innerHTML = editor.innerHTML.replaceAll(
    q,
    `<mark>${q}</mark>`
  );
};

replaceBtn.onclick = () => {
  editor.innerHTML = editor.innerHTML.replaceAll(
    `<mark>${findText.value}</mark>`,
    replaceText.value
  );
};

tableBtn.onclick = () => {
  const table = document.createElement("table");
  table.border = "1";
  table.style.borderCollapse = "collapse";
  table.innerHTML = `
    <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
  `;
  table.querySelectorAll("td").forEach(td => {
    td.contentEditable = true;
    td.style.padding = "8px";
  });

  document.execCommand("insertHTML", false, table.outerHTML);
};

exportDoc.onclick = () => {
  const html = `
    <html><body>${editor.innerHTML}</body></html>
  `;
  const blob = new Blob([html], {
    type: "application/msword"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "document.doc";
  a.click();
};

const API_BASE = "http://localhost:5002/api/admin";

const state = {
  key: localStorage.getItem("adminKey") || "",
};

const tabButtons = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const adminKeyInput = document.getElementById("adminKey");
const connectBtn = document.getElementById("connectBtn");
const statusBar = document.getElementById("statusBar");

const PROGRAMMING_WEB_FALLBACK =
  "https://via.placeholder.com/160x96.png?text=Programming+Web+Course";
const GENERIC_COURSE_FALLBACK =
  "https://via.placeholder.com/160x96.png?text=Course+Image";

adminKeyInput.value = state.key;

const setStatus = (message, type = "info") => {
  statusBar.textContent = message;
  statusBar.className = `status ${type}`;
};

const escapeHtml = (value) =>
  `${value ?? ""}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getCourseImage = (row) => {
  const explicit = `${row.thumbnail || ""}`.trim();
  if (explicit) return explicit;

  const hint = `${row.category || ""} ${row.title || ""}`.toLowerCase();
  if (hint.includes("program") || hint.includes("web")) {
    return PROGRAMMING_WEB_FALLBACK;
  }

  return GENERIC_COURSE_FALLBACK;
};

const renderCourseImage = (_, row) => {
  const src = getCourseImage(row);
  const safeSrc = escapeHtml(src);
  const safeFallback = escapeHtml(PROGRAMMING_WEB_FALLBACK);
  const safeAlt = escapeHtml(`${row.title || "Course"} image`);

  return `<img class="course-thumb" src="${safeSrc}" alt="${safeAlt}" onerror="this.onerror=null;this.src='${safeFallback}'" />`;
};

const headers = () => ({
  "Content-Type": "application/json",
  "x-admin-key": state.key,
});

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers(),
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  return body;
};

const activateTab = (id) => {
  tabButtons.forEach((b) => b.classList.toggle("active", b.dataset.tab === id));
  panels.forEach((p) => p.classList.toggle("active", p.id === id));
};

const renderTablePanel = ({ panelId, title, columns, rows, onRefresh }) => {
  const panel = document.getElementById(panelId);
  const tpl = document.getElementById("tableTemplate");
  panel.innerHTML = "";

  const root = tpl.content.cloneNode(true);
  root.querySelector("h2").textContent = title;
  root.querySelector(".refreshBtn").onclick = onRefresh;

  const thead = root.querySelector("thead");
  const tbody = root.querySelector("tbody");

  const trHead = document.createElement("tr");
  columns.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = c.label;
    trHead.appendChild(th);
  });
  const actionTh = document.createElement("th");
  actionTh.textContent = "Actions";
  trHead.appendChild(actionTh);
  thead.appendChild(trHead);

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    columns.forEach((c) => {
      const td = document.createElement("td");
      td.innerHTML = c.render ? c.render(row[c.key], row) : row[c.key] ?? "";
      tr.appendChild(td);
    });

    const actionTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "action-btn";
    editBtn.onclick = () => cEdit(panelId, row, onRefresh);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "action-btn delete";
    delBtn.onclick = () => cDelete(panelId, row.id, onRefresh);

    actionTd.appendChild(editBtn);
    actionTd.appendChild(delBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });

  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = columns.length + 1;
    td.className = "empty-state";
    td.textContent = "No records found.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  panel.appendChild(root);
};

const cEdit = async (panelId, row, onRefresh) => {
  try {
    if (panelId === "courses") {
      const title = prompt("Course title", row.title);
      if (title == null) return;
      const category = prompt("Category", row.category);
      if (category == null) return;
      const thumbnail = prompt("Picture URL", row.thumbnail || "");
      if (thumbnail == null) return;
      await request(`/courses/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ title, category, thumbnail }),
      });
    } else if (panelId === "mentors") {
      const name = prompt("Mentor name", row.name);
      if (name == null) return;
      await request(`/mentors/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
    } else if (panelId === "members") {
      const name = prompt("Member name", row.name);
      if (name == null) return;
      await request(`/members/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
    }

    alert("Updated");
    await onRefresh();
  } catch (e) {
    alert(e.message);
  }
};

const cDelete = async (panelId, id, onRefresh) => {
  const ok = confirm("Delete this record?");
  if (!ok) return;

  try {
    const path =
      panelId === "courses"
        ? `/courses/${id}`
        : panelId === "mentors"
        ? `/mentors/${id}`
        : `/members/${id}`;

    await request(path, { method: "DELETE" });
    alert("Deleted");
    await onRefresh();
  } catch (e) {
    alert(e.message);
  }
};

const loadCourses = async () => {
  const rows = await request("/courses");
  renderTablePanel({
    panelId: "courses",
    title: `Courses (${rows.length})`,
    rows,
    columns: [
      { key: "id", label: "ID" },
      { key: "thumbnail", label: "Picture", render: renderCourseImage },
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "mentorName", label: "Mentor" },
      { key: "memberCount", label: "Members" },
      { key: "duration", label: "Hours/Duration" },
      {
        key: "description",
        label: "Description",
        render: (v) => `<span class="small">${(v || "").slice(0, 80)}</span>`,
      },
    ],
    onRefresh: loadCourses,
  });
};

const loadMentors = async () => {
  const rows = await request("/mentors");
  renderTablePanel({
    panelId: "mentors",
    title: `Mentors (${rows.length})`,
    rows,
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "phone", label: "Phone" },
      { key: "lastLoginAt", label: "Last Login" },
    ],
    onRefresh: loadMentors,
  });
};

const loadMembers = async () => {
  const rows = await request("/members");
  renderTablePanel({
    panelId: "members",
    title: `Members (${rows.length})`,
    rows,
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "lastLoginAt", label: "Last Login" },
    ],
    onRefresh: loadMembers,
  });
};

const loadAll = async () => {
  try {
    setStatus("Loading admin data...", "info");
    await Promise.all([loadCourses(), loadMentors(), loadMembers()]);
    setStatus(
      "Connected. You can now manage courses, mentors, and members.",
      "success"
    );
  } catch (e) {
    setStatus(e.message || "Failed to load admin data", "error");
    alert(e.message);
  }
};

connectBtn.onclick = async () => {
  state.key = adminKeyInput.value.trim();
  localStorage.setItem("adminKey", state.key);

  if (!state.key) {
    setStatus("Please enter your admin key before connecting.", "error");
    return;
  }

  await loadAll();
};

tabButtons.forEach((btn) => {
  btn.onclick = () => activateTab(btn.dataset.tab);
});

if (state.key) {
  setStatus("Saved admin key found. Loading data...", "info");
  loadAll();
} else {
  setStatus("Enter your admin key and click Connect.", "info");
}

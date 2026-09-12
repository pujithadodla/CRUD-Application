// ===== State =====
// Seed data is backdated so it doesn't count toward "Added Today" on load.
const SEED_DATE = "2026-01-01T00:00:00.000Z";

let students = [
    { id: 1, name: "Amara Okafor", email: "amara.o@gmail.com", phone: "9876543210", gender: "Female", course: "Developer", createdAt: SEED_DATE },
    { id: 2, name: "Rahul Sharma", email: "rahul.s@gmail.com", phone: "9123456789", gender: "Male", course: "Code Writer", createdAt: SEED_DATE },
    { id: 3, name: "Priya Nair", email: "priya.n@gmail.com", phone: "9988776655", gender: "Female", course: "IT", createdAt: SEED_DATE },
    { id: 4, name: "Vikram Singh", email: "vikram.s@gmail.com", phone: "9012345678", gender: "Male", course: "Intern", createdAt: SEED_DATE }
];

let nextId = students.length + 1;
let editingId = null;

// ===== DOM refs =====
const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const genderInput = document.getElementById("gender");
const courseInput = document.getElementById("course");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const searchInput = document.getElementById("searchInput");
const tableBody = document.getElementById("studentTableBody");
const totalStudentsEl = document.getElementById("totalStudents");
const totalStudentsCaption = document.getElementById("totalStudentsCaption");
const enrolledTodayEl = document.getElementById("enrolledToday");
const enrolledTodayCaption = document.getElementById("enrolledTodayCaption");

// ===== Render =====
function renderTable(list) {
    tableBody.innerHTML = "";

    if (list.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">No people found</td>
            </tr>
        `;
        return;
    }

    list.forEach(person => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${person.id}</td>
            <td class="name-cell">${escapeHtml(person.name)}</td>
            <td>${escapeHtml(person.email)}</td>
            <td>${escapeHtml(person.phone)}</td>
            <td>${escapeHtml(person.gender || "-")}</td>
            <td>${escapeHtml(person.course)}</td>
            <td>
                <div class="actions">
                    <button class="btn-edit" data-id="${person.id}">✏️ Edit</button>
                    <button class="btn-delete" data-id="${person.id}">🗑️ Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // wire up buttons after render
    tableBody.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => startEdit(Number(btn.dataset.id)));
    });
    tableBody.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", () => deleteStudent(Number(btn.dataset.id)));
    });
}

function isToday(isoString) {
    if (!isoString) return false;
    const d = new Date(isoString);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
}

function updateStats() {
    totalStudentsEl.textContent = students.length;
    totalStudentsCaption.textContent = `${students.length} people in the database`;

    const addedToday = students.filter(s => isToday(s.createdAt)).length;
    enrolledTodayEl.textContent = addedToday;
    enrolledTodayCaption.textContent = addedToday === 0
        ? "No new entries today"
        : `${addedToday} new entr${addedToday > 1 ? "ies" : "y"} today`;
}

function refresh() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = query
        ? students.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query) ||
            s.course.toLowerCase().includes(query) ||
            (s.gender || "").toLowerCase().includes(query)
          )
        : students;

    renderTable(filtered);
    updateStats();
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ===== Form handling =====
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        gender: genderInput.value,
        course: courseInput.value.trim()
    };

    if (!data.name || !data.email) return;

    if (editingId !== null) {
        students = students.map(s => s.id === editingId ? { ...s, ...data } : s);
        exitEditMode();
    } else {
        students.push({ id: nextId++, ...data, createdAt: new Date().toISOString() });
    }

    form.reset();
    refresh();
});

function startEdit(id) {
    const person = students.find(s => s.id === id);
    if (!person) return;

    editingId = id;
    nameInput.value = person.name;
    emailInput.value = person.email;
    phoneInput.value = person.phone;
    genderInput.value = person.gender || "";
    courseInput.value = person.course;

    formTitle.textContent = "Edit Person";
    submitBtn.textContent = "Save Changes";
    cancelBtn.style.display = "inline-block";

    nameInput.focus();
}

function exitEditMode() {
    editingId = null;
    formTitle.textContent = "Add Person";
    submitBtn.textContent = "Add Person";
    cancelBtn.style.display = "none";
}

cancelBtn.addEventListener("click", () => {
    form.reset();
    exitEditMode();
});

function deleteStudent(id) {
    students = students.filter(s => s.id !== id);
    if (editingId === id) {
        form.reset();
        exitEditMode();
    }
    refresh();
}

// ===== Search =====
searchInput.addEventListener("input", refresh);

// ===== Init =====
refresh();

// Recheck "Added Today" periodically so it rolls over correctly past midnight
// without needing a page reload.
setInterval(updateStats, 60 * 1000);
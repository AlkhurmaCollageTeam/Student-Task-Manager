"use strict";

// Student Hub: beginner-friendly JavaScript; no server or database required.
// Data is stored in the current browser using localStorage.
const STORAGE_KEY = "student-hub-tasks-v1";
const sampleTasks = [
  { id: "demo-1", title: "مراجعة أساسيات HTML", category: "مراجعة", dueDate: "", done: true },
  { id: "demo-2", title: "تجهيز مشروع GitHub", category: "مشروع", dueDate: "", done: false },
  { id: "demo-3", title: "حل تمارين JavaScript", category: "دراسة", dueDate: "", done: false }
];
const tips = [
  "قسّمي المهام الكبيرة إلى خطوات صغيرة؛ البداية أسهل مما تتوقعين.",
  "جرّبي المذاكرة لمدة 25 دقيقة، ثم خذي استراحة قصيرة.",
  "ابدئي بالمهمة الأهم عندما يكون تركيزك في أعلى مستوياته.",
  "المراجعة المنتظمة أفضل من تكديس الدروس في آخر يوم.",
  "اكتبي ثلاثة أهداف واقعية ليومك واحتفلي بإنجازها."
];

const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskCategoryInput = document.getElementById("task-category");
const taskDateInput = document.getElementById("task-date");
const dateTrigger = document.getElementById("date-trigger");
const dateDisplay = document.getElementById("date-display");

function updateDateDisplay() {
  if (!taskDateInput.value) {
    dateDisplay.textContent = "اختاري التاريخ (اختياري)";
    return;
  }

  const date = new Date(`${taskDateInput.value}T12:00:00`);

  dateDisplay.textContent = new Intl.DateTimeFormat(
    "ar-SA-u-ca-gregory",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(date);
}

dateTrigger.addEventListener("click", () => {
  if (typeof taskDateInput.showPicker === "function") {
    try {
      taskDateInput.showPicker();
    } catch (error) {
      taskDateInput.focus();
      taskDateInput.click();
    }
  } else {
    taskDateInput.focus();
    taskDateInput.click();
  }
});

taskDateInput.addEventListener("change", updateDateDisplay);
taskDateInput.addEventListener("input", updateDateDisplay);

updateDateDisplay();
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const storageNotice = document.getElementById("storage-notice");
const filterButtons = document.querySelectorAll("[data-filter]");
let activeFilter = "all";
let currentTipIndex = 0;

function readTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return sampleTasks.map(task => ({ ...task }));
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(task => task && typeof task.id === "string" && typeof task.title === "string")
      .map(task => ({ id: task.id, title: task.title, category: typeof task.category === "string" ? task.category : "أخرى", dueDate: typeof task.dueDate === "string" ? task.dueDate : "", done: task.done === true }));
  } catch (error) {
    storageNotice.hidden = false;
    return sampleTasks.map(task => ({ ...task }));
  }
}
let tasks = readTasks();

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    storageNotice.hidden = true;
  } catch (error) {
    storageNotice.hidden = false;
  }
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short" }).format(date);
}

function renderStats() {
  const total = tasks.length;
  const done = tasks.filter(task => task.done).length;
  const remaining = total - done;
  const percent = total ? Math.round(done / total * 100) : 0;
  document.getElementById("total-count").textContent = String(total);
  document.getElementById("done-count").textContent = String(done);
  document.getElementById("remaining-count").textContent = String(remaining);
  document.getElementById("progress-percent").textContent = `${percent}%`;
  const ring = document.getElementById("progress-ring");
  ring.style.background = `conic-gradient(#7764cf 0% ${percent}%, #efecfb ${percent}% 100%)`;
  ring.setAttribute("aria-label", `نسبة إنجاز المهام ${percent} بالمئة`);
  document.getElementById("progress-message").textContent = total === 0
    ? "أضيفي أول مهمة وابدئي رحلة الإنجاز!"
    : remaining === 0 ? "ممتاز! أنجزتِ كل مهامك 🎉" : "كل مهمة تنجزينها تقربك من هدفك.";
}

function makeTaskItem(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.done ? " is-done" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-check";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", `تحديد المهمة ${task.title} كمنجزة`);
  checkbox.addEventListener("change", () => {
    task.done = checkbox.checked;
    saveTasks();
    render();
  });

  const main = document.createElement("div");
  main.className = "task-main";
  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.title; // textContent prevents HTML injection from user input.
  const meta = document.createElement("div");
  meta.className = "task-meta";
  const category = document.createElement("span");
  category.className = "task-tag";
  category.textContent = task.category;
  meta.appendChild(category);
  if (task.dueDate) {
    const date = document.createElement("span");
    date.className = "task-date";
    date.textContent = `◷ ${formatDate(task.dueDate)}`;
    meta.appendChild(date);
  }
  main.append(title, meta);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-btn";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `حذف المهمة ${task.title}`);
  remove.title = "حذف المهمة";
  remove.addEventListener("click", () => {
    tasks = tasks.filter(item => item.id !== task.id);
    saveTasks();
    render();
  });
  item.append(checkbox, main, remove);
  return item;
}

function render() {
  renderStats();
  const visible = tasks.filter(task => activeFilter === "all" || (activeFilter === "done" ? task.done : !task.done));
  taskList.replaceChildren(...visible.map(makeTaskItem));
  emptyState.hidden = visible.length > 0;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) return;
  const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  tasks.unshift({ id, title, category: taskCategoryInput.value, dueDate: taskDateInput.value, done: false });
  saveTasks();
  taskForm.reset();
  updateDateDisplay();
  activeFilter = "all";
  updateFilterButtons();
  render();
  taskTitleInput.focus();
});

function updateFilterButtons() {
  filterButtons.forEach(button => {
    const active = button.dataset.filter === activeFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
filterButtons.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  updateFilterButtons();
  render();
}));

document.getElementById("next-tip").addEventListener("click", () => {
  currentTipIndex = (currentTipIndex + 1) % tips.length;
  document.getElementById("study-tip").textContent = tips[currentTipIndex];
});

document.getElementById("today-label").textContent = new Intl.DateTimeFormat("ar-SA", {
  weekday: "long", day: "numeric", month: "long"
}).format(new Date());

saveTasks(); // Saves starter tasks only on first load; existing data is preserved.
render();

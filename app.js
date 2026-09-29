const STORAGE_KEY = "taskflow_tasks_v1";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dateInput = document.getElementById("dateInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const countAll = document.getElementById("countAll");
const countActive = document.getElementById("countActive");
const countCompleted = document.getElementById("countCompleted");
const activeCount = document.getElementById("activeCount");
const progressBar = document.getElementById("progressBar");

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  countAll.textContent = total;
  countActive.textContent = active;
  countCompleted.textContent = completed;
  activeCount.textContent = active;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressBar.style.width = `${percent}%`;
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const details = document.createElement("div");
    details.className = "task-details";

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const prioSpan = document.createElement("span");
    prioSpan.className = `prio-pill prio-${task.priority}`;
    prioSpan.textContent = task.priority;
    meta.appendChild(prioSpan);

    if (task.dueDate) {
      const dueSpan = document.createElement("span");
      dueSpan.className = "due-tag";
      dueSpan.textContent = `📅 ${task.dueDate}`;
      meta.appendChild(dueSpan);
    }

    details.appendChild(textSpan);
    details.appendChild(meta);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(details);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });

  updateStats();
}

function addTask(text, priority, dueDate) {
  const newTask = {
    id: Date.now(),
    text,
    priority,
    dueDate,
    completed: false,
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const priority = prioritySelect.value;
  const dueDate = dateInput.value;

  addTask(text, priority, dueDate);

  taskInput.value = "";
  dateInput.value = "";
  prioritySelect.value = "medium";
  taskInput.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  clearCompleted();
});

renderTasks();

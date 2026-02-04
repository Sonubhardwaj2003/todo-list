// script.js
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY_TODOS = "todo-items";
  const STORAGE_KEY_FILTER = "todo-filter";

  // DOM elements
  const form = document.getElementById("todo-form");
  const input = document.getElementById("new-todo-input");
  const list = document.getElementById("todo-list");
  const countSpan = document.getElementById("todo-count");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // State
  let todos = [];
  let currentFilter = "all";

  // ---- LocalStorage helpers ----
  function loadTodosFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TODOS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Error reading todos from localStorage:", err);
      return [];
    }
  }

  function saveTodosToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
    } catch (err) {
      console.error("Error saving todos to localStorage:", err);
    }
  }

  function loadFilterFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILTER);
      if (saved === "all" || saved === "active" || saved === "completed") {
        return saved;
      }
      return "all";
    } catch (err) {
      return "all";
    }
  }

  function saveFilterToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_FILTER, currentFilter);
    } catch (err) {
      console.error("Error saving filter to localStorage:", err);
    }
  }

  // ---- Rendering ----
  function renderTodos() {
    // Clear any initial static HTML items
    list.innerHTML = "";

    let filtered = todos;
    if (currentFilter === "active") {
      filtered = todos.filter((t) => !t.completed);
    } else if (currentFilter === "completed") {
      filtered = todos.filter((t) => t.completed);
    }

    filtered.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.dataset.id = String(todo.id);

      const mainDiv = document.createElement("div");
      mainDiv.className = "todo-main";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "todo-checkbox";
      checkbox.checked = todo.completed;

      const span = document.createElement("span");
      span.className = "todo-text";
      if (todo.completed) {
        span.classList.add("completed");
      }
      span.textContent = todo.text;

      mainDiv.appendChild(checkbox);
      mainDiv.appendChild(span);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "todo-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "todo-btn edit";
      editBtn.textContent = "Edit";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "todo-btn delete";
      deleteBtn.textContent = "Delete";

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(mainDiv);
      li.appendChild(actionsDiv);

      list.appendChild(li);
    });

    updateCount();
    updateFilterButtons();
  }

  function updateCount() {
    const remaining = todos.filter((t) => !t.completed).length;
    countSpan.textContent =
      remaining === 1 ? "1 item left" : `${remaining} items left`;
  }

  function updateFilterButtons() {
    filterButtons.forEach((btn) => {
      const filter = btn.getAttribute("data-filter");
      if (filter === currentFilter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // ---- CRUD operations ----
  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const todo = {
      id: Date.now(),
      text: trimmed,
      completed: false,
    };

    todos.push(todo);
    saveTodosToStorage();
    renderTodos();
  }

  function toggleTodo(id) {
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return;

    todos[idx].completed = !todos[idx].completed;
    saveTodosToStorage();
    renderTodos();
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodosToStorage();
    renderTodos();
  }

  function editTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newText = window.prompt("Edit task:", todo.text);
    if (newText === null) return; // cancelled
    const trimmed = newText.trim();
    if (!trimmed) return; // ignore empty

    todo.text = trimmed;
    saveTodosToStorage();
    renderTodos();
  }

  function setFilter(filter) {
    if (!["all", "active", "completed"].includes(filter)) return;
    currentFilter = filter;
    saveFilterToStorage();
    renderTodos();
  }

  // ---- Event listeners ----

  // Add todo on form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    addTodo(value);
    input.value = "";
    input.focus();
  });

  // Delegated events for checkbox, edit, delete
  list.addEventListener("change", (e) => {
    const target = e.target;
    if (target.matches(".todo-checkbox")) {
      const li = target.closest(".todo-item");
      if (!li) return;
      const id = Number(li.dataset.id);
      toggleTodo(id);
    }
  });

  list.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.matches(".todo-btn.delete")) {
      const li = target.closest(".todo-item");
      if (!li) return;
      const id = Number(li.dataset.id);
      deleteTodo(id);
    }

    if (target.matches(".todo-btn.edit")) {
      const li = target.closest(".todo-item");
      if (!li) return;
      const id = Number(li.dataset.id);
      editTodo(id);
    }
  });

  // Filter buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      if (!filter) return;
      setFilter(filter);
    });
  });

  // ---- Init ----
  (function init() {
    todos = loadTodosFromStorage();
    currentFilter = loadFilterFromStorage();
    renderTodos();
  })();
});

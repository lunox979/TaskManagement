(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // DATA STORE
  // ─────────────────────────────────────────────

  let tasks = [];
  let nextId = 1;

  const PRIORITY_LABEL = { high: '高', mid: '中', low: '低' };
  const PRIORITY_CLASS  = { high: 'priority-high', mid: 'priority-mid', low: 'priority-low' };
  const PRIORITY_ORDER  = { high: 0, mid: 1, low: 2 };

  function priorityRank(p) {
    return p !== null && p !== undefined && PRIORITY_ORDER[p] !== undefined
      ? PRIORITY_ORDER[p]
      : 3;
  }

  function getTasksByStatus(status) {
    return tasks
      .filter(t => t.status === status)
      .sort((a, b) => a.order - b.order);
  }

  function getTaskById(id) {
    return tasks.find(t => t.id === id);
  }

  function addTask(data) {
    const tasksInCol = getTasksByStatus(data.status);
    const order = tasksInCol.length > 0
      ? tasksInCol[tasksInCol.length - 1].order + 1
      : 0;
    const task = {
      id:          nextId++,
      title:       data.title       || '',
      description: data.description || '',
      priority:    data.priority    || null,
      dueDate:     data.dueDate     || '',
      status:      data.status,
      order,
    };
    tasks.push(task);
    return task;
  }

  function updateTask(id, changes) {
    const task = getTaskById(id);
    if (task) Object.assign(task, changes);
  }

  function deleteTask(id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) tasks.splice(idx, 1);
  }

  function sortColumnByPriority(status) {
    const sorted = getTasksByStatus(status);
    sorted.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
    sorted.forEach((t, i) => { t.order = i; });
  }

  function insertByPriority(id, targetStatus) {
    const task = getTaskById(id);
    if (!task) return;
    task.status = targetStatus;

    const sorted = getTasksByStatus(targetStatus).filter(t => t.id !== id);
    sorted.push(task);
    sorted.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
    sorted.forEach((t, i) => { t.order = i; });
  }

  function reorderTask(id, targetStatus, afterId) {
    const task = getTaskById(id);
    if (!task) return;

    task.status = targetStatus;

    const sorted = getTasksByStatus(targetStatus).filter(t => t.id !== id);

    let insertIdx;
    if (afterId == null) {
      insertIdx = sorted.length;
    } else {
      const afterIdx = sorted.findIndex(t => t.id === afterId);
      insertIdx = afterIdx === -1 ? sorted.length : afterIdx;
    }

    sorted.splice(insertIdx, 0, task);
    sorted.forEach((t, i) => { t.order = i; });
  }

  // ─────────────────────────────────────────────
  // SAMPLE DATA
  // ─────────────────────────────────────────────

  const SAMPLE_TASKS = [
    { title: 'デザインレビュー',      description: '画面設計書を確認する',         priority: 'high', dueDate: '2026-05-01', status: 'todo' },
    { title: 'APIドキュメント作成',   description: 'REST APIの仕様をまとめる',     priority: 'mid',  dueDate: '2026-05-10', status: 'todo' },
    { title: '環境構築',             description: 'Node.js + DB セットアップ',    priority: 'low',  dueDate: '',           status: 'todo' },
    { title: 'ログイン画面実装',      description: 'フロントエンドのUI実装',        priority: 'high', dueDate: '2026-04-30', status: 'inprogress' },
    { title: 'DB設計',               description: 'ER図を作成し、テーブル定義完了', priority: 'mid',  dueDate: '',           status: 'done' },
    { title: '要件定義',             description: '',                            priority: null,   dueDate: '',           status: 'done' },
    { title: 'プロジェクト立ち上げ', description: '',                            priority: 'low',  dueDate: '',           status: 'done' },
  ];

  // ─────────────────────────────────────────────
  // RENDER ENGINE
  // ─────────────────────────────────────────────

  function formatDate(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
  }

  function createCardEl(task) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = task.id;
    card.draggable = true;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${task.title} — 編集`);

    const titleEl = document.createElement('div');
    titleEl.className = 'card-title';
    titleEl.textContent = task.title;
    card.appendChild(titleEl);

    if (task.priority || task.dueDate) {
      const meta = document.createElement('div');
      meta.className = 'card-meta';

      if (task.priority) {
        const badge = document.createElement('span');
        badge.className = `priority-badge ${PRIORITY_CLASS[task.priority]}`;
        badge.textContent = PRIORITY_LABEL[task.priority];
        meta.appendChild(badge);
      }

      if (task.dueDate) {
        const due = document.createElement('span');
        due.className = 'due-date';
        due.textContent = `期限: ${formatDate(task.dueDate)}`;
        meta.appendChild(due);
      }

      card.appendChild(meta);
    }

    return card;
  }

  function renderBoard() {
    ['todo', 'inprogress', 'done'].forEach(status => {
      const list  = document.getElementById('list-' + status);
      const count = document.getElementById('count-' + status);
      const sorted = getTasksByStatus(status);

      count.textContent = sorted.length;
      list.innerHTML = '';
      sorted.forEach(task => list.appendChild(createCardEl(task)));
    });

    attachDragListeners();
  }

  // ─────────────────────────────────────────────
  // MODAL CONTROLLER
  // ─────────────────────────────────────────────

  let modalMode    = null;
  let editingId    = null;
  let addingStatus = null;

  const modalOverlay  = document.getElementById('modal-overlay');
  const modalTitle    = document.getElementById('modal-title');
  const inputTitle    = document.getElementById('input-title');
  const inputDesc     = document.getElementById('input-desc');
  const inputPriority = document.getElementById('input-priority');
  const inputDue      = document.getElementById('input-due');
  const btnDelete     = document.getElementById('btn-delete');
  const btnCancel     = document.getElementById('btn-cancel');
  const btnSave       = document.getElementById('btn-save');

  function resetForm() {
    inputTitle.value    = '';
    inputDesc.value     = '';
    inputPriority.value = '';
    inputDue.value      = '';
    btnSave.disabled    = true;
  }

  function openAddModal(status) {
    modalMode    = 'add';
    addingStatus = status;
    editingId    = null;

    modalTitle.textContent = 'タスクを追加';
    resetForm();
    btnDelete.hidden = true;
    modalOverlay.hidden = false;
    inputTitle.focus();
  }

  function openEditModal(id) {
    const task = getTaskById(id);
    if (!task) return;

    modalMode    = 'edit';
    editingId    = id;
    addingStatus = null;

    modalTitle.textContent  = 'タスクを編集';
    inputTitle.value        = task.title;
    inputDesc.value         = task.description;
    inputPriority.value     = task.priority || '';
    inputDue.value          = task.dueDate  || '';
    btnSave.disabled        = task.title.trim() === '';
    btnDelete.hidden        = false;
    modalOverlay.hidden     = false;
    inputTitle.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    modalMode    = null;
    editingId    = null;
    addingStatus = null;
  }

  function saveTask() {
    const title = inputTitle.value.trim();
    if (!title) return;

    const changes = {
      title,
      description: inputDesc.value.trim(),
      priority:    inputPriority.value || null,
      dueDate:     inputDue.value      || '',
    };

    if (modalMode === 'add') {
      addTask({ ...changes, status: addingStatus });
    } else if (modalMode === 'edit') {
      updateTask(editingId, changes);
    }

    closeModal();
    renderBoard();
  }

  // ─────────────────────────────────────────────
  // DELETE DIALOG
  // ─────────────────────────────────────────────

  const dialogOverlay = document.getElementById('dialog-overlay');
  const dialogCancel  = document.getElementById('dialog-cancel');
  const dialogOk      = document.getElementById('dialog-ok');

  function openDeleteDialog() {
    dialogOverlay.hidden = false;
  }

  function closeDeleteDialog() {
    dialogOverlay.hidden = true;
  }

  // ─────────────────────────────────────────────
  // DRAG & DROP
  // ─────────────────────────────────────────────

  let draggedId = null;
  let draggedEl = null;

  const dropIndicator = document.createElement('div');
  dropIndicator.className = 'drop-indicator';
  dropIndicator.hidden = true;
  document.body.appendChild(dropIndicator);

  function getDragAfterElement(list, y) {
    const cards = [...list.querySelectorAll('.card:not(.dragging)')];
    return cards.reduce((closest, card) => {
      const box    = card.getBoundingClientRect();
      const offset = y - (box.top + box.height / 2);
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: card };
      }
      return closest;
    }, { offset: -Infinity }).element;
  }

  function attachDragListeners() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedId = parseInt(card.dataset.id);
        draggedEl = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedId);
      });

      card.addEventListener('dragend', () => {
        if (draggedEl) draggedEl.classList.remove('dragging');
        dropIndicator.hidden = true;
        document.querySelectorAll('.card-list').forEach(l => l.classList.remove('drag-over'));
        draggedId = null;
        draggedEl = null;
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEditModal(parseInt(card.dataset.id));
        }
      });
    });

    document.querySelectorAll('.card-list').forEach(list => {
      list.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        list.classList.add('drag-over');

        const afterEl = getDragAfterElement(list, e.clientY);
        dropIndicator.hidden = false;
        if (afterEl) {
          list.insertBefore(dropIndicator, afterEl);
        } else {
          list.appendChild(dropIndicator);
        }
      });

      list.addEventListener('dragleave', (e) => {
        if (!list.contains(e.relatedTarget)) {
          list.classList.remove('drag-over');
        }
      });

      list.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetStatus = list.closest('.column').dataset.status;
        const sourceTask   = getTaskById(draggedId);
        const isCrossColumn = sourceTask && sourceTask.status !== targetStatus;

        if (isCrossColumn) {
          insertByPriority(draggedId, targetStatus);
        } else {
          const afterEl = getDragAfterElement(list, e.clientY);
          const afterId = afterEl ? parseInt(afterEl.dataset.id) : null;
          reorderTask(draggedId, targetStatus, afterId);
        }

        list.classList.remove('drag-over');
        dropIndicator.hidden = true;
        renderBoard();
      });
    });
  }

  // ─────────────────────────────────────────────
  // EVENT WIRING
  // ─────────────────────────────────────────────

  function wireEvents() {
    // Add button (delegated to board)
    document.getElementById('board').addEventListener('click', (e) => {
      const btn = e.target.closest('.add-btn');
      if (btn) openAddModal(btn.dataset.status);

      const sortBtn = e.target.closest('.sort-btn');
      if (sortBtn) {
        sortColumnByPriority(sortBtn.dataset.status);
        renderBoard();
      }
    });

    // Card click (delegated to document — handles dynamically added cards)
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (card) openEditModal(parseInt(card.dataset.id));
    });

    // Modal form
    inputTitle.addEventListener('input', () => {
      btnSave.disabled = inputTitle.value.trim() === '';
    });

    btnCancel.addEventListener('click', closeModal);
    btnSave.addEventListener('click', saveTask);
    btnDelete.addEventListener('click', openDeleteDialog);

    // Modal backdrop
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Prevent modal click from bubbling to document (card delegate)
    document.querySelector('.modal').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Delete dialog
    dialogCancel.addEventListener('click', closeDeleteDialog);
    dialogOk.addEventListener('click', () => {
      if (editingId !== null) deleteTask(editingId);
      closeDeleteDialog();
      closeModal();
      renderBoard();
    });

    dialogOverlay.addEventListener('click', (e) => {
      if (e.target === dialogOverlay) closeDeleteDialog();
    });

    document.querySelector('.dialog').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    SAMPLE_TASKS.forEach(t => addTask(t));
    wireEvents();
    renderBoard();
  });

})();

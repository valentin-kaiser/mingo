 // ---------- Storage ----------
    const STORE_KEY = 'mingo-tasks';
    let tasks = loadTasks();

    function loadTasks() {
      try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
      catch { return []; }
    }
    function saveTasks() { localStorage.setItem(STORE_KEY, JSON.stringify(tasks)); }

    // ---------- DOM ----------
    const $ = sel => document.querySelector(sel);
    const elExpression = $('#expression');
    const elNote = $('#note');
    const listWrap = $('#listWrap');
    const bingoBtn = $('#bingoBtn');
    const nextBtn = $('#nextBtn');
    const resetBtn = $('#resetBtn');
    const controls = $('#controls');
    const board = document.querySelector('.board');
    const buzzerWrap = document.querySelector('.buzzer-wrap');
    const settingsDialog = $('#settingsDialog');

    // ---------- Settings ----------
    const settings = {
      get ops() {
        const ops = [];
        if ($('#opAdd').checked) ops.push('add');
        if ($('#opSub').checked) ops.push('sub');
        if ($('#opMul').checked) ops.push('mul');
        if ($('#opDiv').checked) ops.push('div');
        return ops.length ? ops : ['mul']; // Fallback
      },
      get rangeMax() { return parseInt($('#rangeMax').value, 10); },
      get smallTimes() { return $('#smallTimes').checked; },
      get noNeg() { return $('#noNegatives').checked; },
      get wholeDiv() { return $('#wholeDivision').checked; },
    };

    // ---------- Helpers ----------
    const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    function makeTask() {
      const ops = settings.ops;
      const op = ops[rndInt(0, ops.length - 1)];
      let a, b, expr, answer;

      if (op === 'mul') {
        a = settings.smallTimes ? rndInt(1, 10) : rndInt(1, settings.rangeMax);
        b = settings.smallTimes ? rndInt(1, 10) : rndInt(1, settings.rangeMax);
        answer = a * b; expr = `${a} × ${b}`;
        return { expr, answer, op, a, b, t: Date.now() };
      }
      if (op === 'add') {
        a = rndInt(1, settings.rangeMax); b = rndInt(1, settings.rangeMax);
        answer = a + b; expr = `${a} + ${b}`;
        return { expr, answer, op, a, b, t: Date.now() };
      }
      if (op === 'sub') {
        let x = rndInt(1, settings.rangeMax), y = rndInt(1, settings.rangeMax);
        if (settings.noNeg && y > x) [x, y] = [y, x];
        a = x; b = y; answer = a - b; expr = `${a} − ${b}`;
        return { expr, answer, op, a, b, t: Date.now() };
      }
      // div (default)
      if (settings.wholeDiv) {
        const baseA = settings.smallTimes ? rndInt(1, 10) : rndInt(1, settings.rangeMax);
        const baseB = settings.smallTimes ? rndInt(1, 10) : rndInt(1, settings.rangeMax);
        a = baseA * baseB; b = baseA; answer = baseB;
      } else {
        b = rndInt(1, settings.rangeMax);
        a = rndInt(1, settings.rangeMax) * b;
        answer = a / b;
      }
      expr = `${a} ÷ ${b}`;
      return { expr, answer, op, a, b, t: Date.now() };
    }

    function showTask(task) {
      elExpression.textContent = task.expr;
      elExpression.dataset.answer = task.answer;
      elExpression.classList.remove('placeholder');
      elNote.textContent = 'Auf „Bingo!“ drücken, wenn ihr fertig seid – oder „Weiter“ für die nächste Aufgabe.';
    }

    function setPlaceholder() {
      elExpression.textContent = '? × ?';
      elExpression.removeAttribute('data-answer');
      elExpression.classList.add('placeholder');
    }

    function clearTaskAfterBingo() {
      setPlaceholder();
      elNote.textContent = '🎉 Bingo! Alle Lösungen unten sichtbar.';
    }

    function addTask(task) {
      tasks.push(task);
      saveTasks();
      renderList(false);
      updateBingoState();
    }

    function renderList(showAll = false) {
      if (!tasks.length) {
        listWrap.style.display = 'none';
        elNote.textContent = 'Noch keine Aufgaben. Klicke „Weiter“, um die erste zu erstellen.';
        $('#hideSolutionsBtn').hidden = true;
        updateBingoState();
        return;
      }
      listWrap.style.display = 'block';
      const rows = tasks.map((t, i) => `<tr>
          <td style="width:42px; opacity:.7">${i + 1}</td>
          <td>${t.expr}</td>
          <td style="width:24px; text-align:center">=</td>
          <td><strong>${showAll ? t.answer : '✱'}</strong></td>
        </tr>`).slice().reverse().join('');
      listWrap.innerHTML = `<table>
        <thead><tr><th>#</th><th>Aufgabe</th><th></th><th>Lösung</th></tr></thead>
        <tbody>${rows}</tbody></table>`;
      $('#hideSolutionsBtn').hidden = !showAll;
      updateBingoState();
    }

    function celebrate(count = 36) {
      const layer = $('#celebration');
      layer.innerHTML = '';
      const W = window.innerWidth;
      for (let i = 0; i < count; i++) {
        const b = document.createElement('span');
        b.className = 'balloon';
        b.textContent = '🎈';
        const startX = Math.random() * W;
        const drift = (Math.random() * 2 - 1) * (W * .35);
        const dur = (1 + Math.random() * 3).toFixed(2) + 's';
        const delay = (Math.random() * 0.8).toFixed(2) + 's';
        b.style.left = startX + 'px';
        b.style.setProperty('--rise-duration', dur);
        b.style.setProperty('--rise-x', drift + 'px');
        b.style.animationDelay = delay;
        layer.appendChild(b);
      }
      cueGlowAndCleanup(9000);
    }

    function cueGlowAndCleanup(timeout = 8000) {
      board.classList.add('winner-glow');
      setTimeout(() => board.classList.remove('winner-glow'), 1300);
      setTimeout(() => $('#celebration').innerHTML = '', timeout);
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }

    function updateBingoState() {
      const enabled = tasks.length >= 4;
      bingoBtn.disabled = !enabled;
      bingoBtn.setAttribute('aria-disabled', String(!enabled));
      bingoBtn.title = enabled ? 'Bingo – Lösungen zeigen' : 'Mindestens 4 Aufgaben nötig';
    }

    // ---------- Events ----------
    $('#rangeMax').addEventListener('input', (e) => $('#rangeLabel').textContent = `1–${e.target.value}`);
    $('#rangeLabel').textContent = `1–${$('#rangeMax').value}`;

    nextBtn.addEventListener('click', () => {
      const t = makeTask();
      addTask(t);
      showTask(t);
    });

    bingoBtn.addEventListener('click', () => {
      if (bingoBtn.disabled) return;

      // Anzeigen & feiern
      clearTaskAfterBingo();
      renderList(true);
      celebrate();

      // UI-Zustand: Aufgabe & Bingo-Button weg, Liste hervorheben, Weiter gesperrt
      board.classList.add('hidden');
      buzzerWrap.classList.add('hidden');
      listWrap.classList.add('highlight');
      nextBtn.hidden = true;
      nextBtn.disabled = true;
      controls.style.display = 'none';
      $('#hideSolutionsBtn').hidden = true;
      // Fokus auf Reset und zur Liste scrollen
      resetBtn.focus({ preventScroll: true });
      listWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Hinweistext für Reset
      elNote.textContent = '🎉 Bingo abgeschlossen. Zum Neustart bitte „Zurücksetzen“ drücken.';
    });

    $('#hideSolutionsBtn').addEventListener('click', () => {
      renderList(false);
      elNote.textContent = 'Lösungen ausgeblendet. „Bingo!“ zeigt sie wieder an.';
    });

    resetBtn.addEventListener('click', () => {
      if (!confirm('Alle gespeicherten Aufgaben löschen?')) return;
      tasks = [];
      saveTasks();
      renderList(false);
      setPlaceholder();
      // UI zurücksetzen
      board.classList.remove('hidden');
      buzzerWrap.classList.remove('hidden');
      listWrap.classList.remove('highlight');
      nextBtn.hidden = false;
      nextBtn.disabled = false;
      controls.style.display = 'flex';
      elNote.textContent = 'Klicke auf „Weiter“, um zu starten.';
      updateBingoState();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); nextBtn.click(); }
    });

    $('#openSettings').addEventListener('click', () => settingsDialog.showModal());
    $('#closeSettings').addEventListener('click', () => settingsDialog.close());
    $('#cancelSettings').addEventListener('click', () => settingsDialog.close());
    $('#saveSettings').addEventListener('click', () => settingsDialog.close());

    // ---------- Init ----------
    if (tasks.length) {
      showTask(tasks[tasks.length - 1]);
      renderList(false);
    } else {
      setPlaceholder();
    }
    updateBingoState();

    settingsDialog.addEventListener('cancel', (e) => { e.preventDefault(); settingsDialog.close(); });
// quiz.js - home page, section cards, quiz rendering and scoring

(function () {

  // ---- Derive sections and counts ----
  const sectionCounts = {};
  QUESTIONS.forEach(function (q) {
    sectionCounts[q.section] = (sectionCounts[q.section] || 0) + 1;
  });
  const sections = Object.keys(sectionCounts);

  // ---- Fisher-Yates shuffle (returns a new array, does not mutate input) ----
  // Math.random() is intentionally used here: this only randomizes quiz
  // question/option order for a study aid and has no security implications,
  // so a cryptographically secure RNG is not required.
  function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // NOSONAR - non-security-sensitive shuffle
      const tmp = result[i];
      result[i] = result[j];
      result[j] = tmp;
    }
    return result;
  }

  // ---- Build home page ----
  document.getElementById('total-count').textContent =
    sections.length + ' sections, ' + QUESTIONS.length + ' questions in total.';

  const grid = document.getElementById('sections-grid');
  sections.forEach(function (sec) {
    const card = document.createElement('div');
    card.className = 'section-card';
    card.innerHTML =
      '<h3>' + sec + '</h3>' +
      '<span>' + sectionCounts[sec] + ' question' + (sectionCounts[sec] !== 1 ? 's' : '') + '</span>';
    card.addEventListener('click', function () { startQuiz(sec); });
    grid.appendChild(card);
  });

  // ---- Show / hide pages ----
  function showHome(fromPopState) {
    if (!fromPopState && history.state?.view === 'quiz') {
      // Coming from a quiz view via the in-page Home button - go back in
      // history so the browser Back button doesn't re-show the quiz.
      // The popstate handler will perform the UI update; avoid double-rendering.
      history.back();
      return;
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    document.getElementById('home-page').style.display = 'block';
    document.getElementById('quiz-page').style.display = 'none';
    document.getElementById('header-sub').textContent = 'Choose a section below or take the full quiz';
    // Reset quiz state
    document.getElementById('questions-container').innerHTML = '';
    document.getElementById('score-banner').style.display = 'none';
    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Submit Answers';
    btn.disabled = false;

    if (!fromPopState) {
      history.replaceState({ view: 'home' }, '', location.pathname + location.search);
    }
  }

  window.showHome = showHome;

  // ---- Start a quiz for a section (or '__all__') ----
  function startQuizView(section) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const pool = shuffle(
      section === '__all__'
        ? QUESTIONS
        : QUESTIONS.filter(function (q) { return q.section === section; })
    );

    document.getElementById('home-page').style.display = 'none';
    document.getElementById('quiz-page').style.display = 'block';
    document.getElementById('score-banner').style.display = 'none';
    document.getElementById('header-sub').textContent =
      section === '__all__' ? 'Full Quiz' : section;
    document.getElementById('quiz-title').textContent =
      section === '__all__' ? 'Full Quiz' : section;
    document.getElementById('quiz-meta').textContent =
      pool.length + ' question' + (pool.length !== 1 ? 's' : '');

    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Submit Answers';
    btn.disabled = false;

    renderQuestions(pool);
  }

  window.startQuiz = function (section, fromPopState) {
    startQuizView(section);

    if (!fromPopState) {
      history.pushState({ view: 'quiz', section: section }, '', '#section=' + encodeURIComponent(section));
    }
  };

  // ---- Restore view from URL hash on initial load, if valid ----
  (function restoreInitialView() {
    if (history.state) return; // already tagged (e.g. bfcache restore)

    const match = /^#section=(.+)$/.exec(location.hash);
    const section = match && decodeURIComponent(match[1]);
    const isValidSection = section === '__all__' || sections.includes(section);

    if (isValidSection) {
      startQuizView(section);
      history.replaceState({ view: 'quiz', section: section }, '', location.hash);
    } else {
      history.replaceState({ view: 'home' }, '', location.pathname + location.search);
    }
  })();

  // ---- React to browser Back / Forward ----
  window.addEventListener('popstate', function (event) {
    const state = event.state;
    if (state?.view === 'quiz' && state.section) {
      startQuizView(state.section);
    } else {
      showHome(true);
    }
  });

  // ---- Render questions into the form ----
  function renderQuestions(pool) {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    pool.forEach(function (q, idx) {
      const num = idx + 1;

      const block = document.createElement('div');
      block.className = 'question-block';

      const label = document.createElement('h3');
      label.textContent = 'Q' + num + ' - ' + q.section;
      block.appendChild(label);

      const qText = document.createElement('p');
      qText.textContent = q.q;
      block.appendChild(qText);

      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'options';

      // Shuffle the option order and remap the correct answer index
      // so it still points to the right option after reordering.
      const order = shuffle(q.options.map(function (_, i) { return i; }));
      block.dataset.answer = order.indexOf(q.answer);

      order.forEach(function (originalIdx, oi) {
        const lbl = document.createElement('label');
        const inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = 'q' + num;
        inp.value = oi;
        lbl.appendChild(inp);
        lbl.appendChild(document.createTextNode(' ' + q.options[originalIdx]));
        optionsDiv.appendChild(lbl);
      });

      block.appendChild(optionsDiv);

      const note = document.createElement('div');
      note.className = 'result-note';
      block.appendChild(note);

      container.appendChild(block);
    });
  }

  // ---- Handle form submission ----
  document.getElementById('quiz-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const blocks = document.querySelectorAll('.question-block');
    let correct = 0;

    blocks.forEach(function (block) {
      const correctIdx = Number.parseInt(block.dataset.answer, 10);
      const qName = block.querySelector('input[type="radio"]').name;
      const selected = block.querySelector('input[name="' + qName + '"]:checked');
      const labels = block.querySelectorAll('label');
      const note = block.querySelector('.result-note');

      block.querySelectorAll('input').forEach(function (inp) { inp.disabled = true; });

      labels[correctIdx].classList.add('reveal-correct');

      if (selected) {
        const selectedIdx = Number.parseInt(selected.value, 10);
        if (selectedIdx === correctIdx) {
          correct++;
          labels[correctIdx].classList.remove('reveal-correct');
          labels[correctIdx].classList.add('correct');
          note.textContent = 'Correct!';
          note.className = 'result-note right';
        } else {
          labels[selectedIdx].classList.add('incorrect');
          note.textContent = 'Incorrect. The correct answer is highlighted in green.';
          note.className = 'result-note wrong';
        }
      } else {
        note.textContent = 'Not answered. The correct answer is highlighted in green.';
        note.className = 'result-note skipped';
      }
    });

    const total = blocks.length;
    const pct = Math.round((correct / total) * 100);
    document.getElementById('score-text').textContent =
      correct + ' / ' + total + ' (' + pct + '%)';
    const banner = document.getElementById('score-banner');
    banner.style.display = 'block';
    banner.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('submit-btn').textContent = 'Submitted';
    document.getElementById('submit-btn').disabled = true;
  });

  // ---- Back to top button ----
  const backToTopBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', function () {
    backToTopBtn.classList.toggle('visible', window.scrollY > 300);
  });
  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();

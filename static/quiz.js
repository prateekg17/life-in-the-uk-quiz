// quiz.js - home page, section cards, quiz rendering and scoring

(function () {

  // ---- Derive sections and counts ----
  const sectionCounts = {};
  QUESTIONS.forEach(function (q) {
    sectionCounts[q.section] = (sectionCounts[q.section] || 0) + 1;
  });
  const sections = Object.keys(sectionCounts);

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
  function showHome() {
    document.getElementById('home-page').style.display = 'block';
    document.getElementById('quiz-page').style.display = 'none';
    document.getElementById('header-sub').textContent = 'Choose a section below or take the full quiz';
    // Reset quiz state
    document.getElementById('questions-container').innerHTML = '';
    document.getElementById('score-banner').style.display = 'none';
    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Submit Answers';
    btn.disabled = false;
  }

  window.showHome = showHome;

  // ---- Start a quiz for a section (or '__all__') ----
  window.startQuiz = function (section) {
    const pool = section === '__all__'
      ? QUESTIONS
      : QUESTIONS.filter(function (q) { return q.section === section; });

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
  };

  // ---- Render questions into the form ----
  function renderQuestions(pool) {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    pool.forEach(function (q, idx) {
      const num = idx + 1;

      const block = document.createElement('div');
      block.className = 'question-block';
      block.dataset.answer = q.answer;

      const label = document.createElement('h3');
      label.textContent = 'Q' + num + ' - ' + q.section;
      block.appendChild(label);

      const qText = document.createElement('p');
      qText.textContent = q.q;
      block.appendChild(qText);

      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'options';

      q.options.forEach(function (opt, oi) {
        const lbl = document.createElement('label');
        const inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = 'q' + num;
        inp.value = oi;
        lbl.appendChild(inp);
        lbl.appendChild(document.createTextNode(' ' + opt));
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

})();

document.addEventListener('DOMContentLoaded', () => {
  const DIFFICULTY_POINTS = { easy: 1, medium: 2, hard: 3 };

  const state = {
    view: 'config',
    config: {
      topics: new Set(),
      difficulty: 'mixed',
      count: 12
    },
    quiz: {
      questions: [],
      responses: [],
      currentIndex: 0,
      scorePoints: 0,
      possiblePoints: 0,
      topicStats: {}
    },
    streak: 0,
    lastWeakTopics: []
  };

  const els = {
    views: {
      config: document.getElementById('view-config'),
      quiz: document.getElementById('view-quiz'),
      results: document.getElementById('view-results')
    },
    topicSelection: document.getElementById('topic-selection'),
    difficultyButtons: Array.from(document.querySelectorAll('.pill-btn')),
    countInput: document.getElementById('question-count'),
    countCopy: document.getElementById('question-count-copy'),
    startBtn: document.getElementById('start-btn'),
    streakDisplay: document.getElementById('streak-display'),
    sessionModeDisplay: document.getElementById('session-mode-display'),

    progress: document.getElementById('quiz-progress'),
    topicTag: document.getElementById('q-topic-tag'),
    difficultyTag: document.getElementById('q-difficulty-tag'),
    qIndex: document.getElementById('q-index'),
    qType: document.getElementById('q-type-label'),
    qText: document.getElementById('question-text'),
    qContext: document.getElementById('question-context'),
    answerArea: document.getElementById('answer-area'),

    feedbackArea: document.getElementById('feedback-area'),
    feedbackTitle: document.getElementById('feedback-title'),
    feedbackBody: document.getElementById('feedback-body'),

    prevBtn: document.getElementById('prev-btn'),
    checkBtn: document.getElementById('check-btn'),
    nextBtn: document.getElementById('next-btn'),
    quitBtn: document.getElementById('quit-btn'),

    finalScore: document.getElementById('final-score'),
    finalSummary: document.getElementById('final-summary'),
    finalGuidance: document.getElementById('final-guidance'),
    topicPerformance: document.getElementById('topic-performance'),
    missedReview: document.getElementById('missed-review'),
    restartBtn: document.getElementById('restart-btn'),
    retryWeakBtn: document.getElementById('retry-weak-btn')
  };

  init();

  function init() {
    loadStreak();
    renderTopicButtons();
    bindEvents();
    updateCountCopy();
    updateSessionLabel();
    exposeTestingHooks();
  }

  function bindEvents() {
    els.topicSelection.addEventListener('click', handleTopicSelection);

    els.difficultyButtons.forEach((button) => {
      button.addEventListener('click', () => {
        els.difficultyButtons.forEach((b) => b.classList.remove('selected'));
        button.classList.add('selected');
        state.config.difficulty = button.dataset.difficulty;
      });
    });

    els.countInput.addEventListener('input', () => {
      state.config.count = Number(els.countInput.value);
      updateCountCopy();
    });

    els.startBtn.addEventListener('click', startQuiz);
    els.prevBtn.addEventListener('click', prevQuestion);
    els.checkBtn.addEventListener('click', checkCurrentQuestion);
    els.nextBtn.addEventListener('click', nextQuestion);
    els.quitBtn.addEventListener('click', () => {
      switchView('config');
      updateSessionLabel();
    });
    els.restartBtn.addEventListener('click', () => {
      switchView('config');
      updateSessionLabel();
    });
    els.retryWeakBtn.addEventListener('click', retryWeakTopics);

    document.addEventListener('keydown', handleKeyboardShortcuts);
  }

  function renderTopicButtons() {
    const topics = uniqueTopics();
    state.config.topics = new Set(topics);

    els.topicSelection.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'topic-btn selected';
    allBtn.dataset.topic = 'all';
    allBtn.textContent = 'Mix all topics';
    els.topicSelection.appendChild(allBtn);

    topics.forEach((topic) => {
      const btn = document.createElement('button');
      btn.className = 'topic-btn';
      btn.dataset.topic = topic;
      btn.textContent = topic;
      els.topicSelection.appendChild(btn);
    });
  }

  function handleTopicSelection(event) {
    const button = event.target.closest('.topic-btn');
    if (!button) {
      return;
    }

    const topic = button.dataset.topic;
    const allActive = els.topicSelection.querySelector('[data-topic="all"]')?.classList.contains('selected');

    if (topic === 'all') {
      state.config.topics = new Set(uniqueTopics());
      syncTopicButtons();
      return;
    }

    if (allActive) {
      state.config.topics = new Set([topic]);
      syncTopicButtons();
      return;
    }

    if (state.config.topics.has(topic)) {
      state.config.topics.delete(topic);
    } else {
      state.config.topics.add(topic);
    }

    if (state.config.topics.size === 0) {
      state.config.topics = new Set(uniqueTopics());
    }

    syncTopicButtons();
  }

  function startQuiz() {
    const sessionQuestions = buildSessionQuestions();

    if (!sessionQuestions.length) {
      alert('No questions match this setup. Try mixed difficulty or more topics.');
      return;
    }

    state.quiz.questions = sessionQuestions;
    state.quiz.responses = Array.from({ length: sessionQuestions.length }, () => ({
      submitted: false,
      correct: false,
      answerPayload: null,
      scoreWeight: 0
    }));
    state.quiz.currentIndex = 0;
    state.quiz.scorePoints = 0;
    state.quiz.possiblePoints = sessionQuestions.reduce((sum, q) => sum + questionWeight(q), 0);
    state.quiz.topicStats = buildTopicStats(sessionQuestions);

    switchView('quiz');
    updateSessionLabel();
    renderQuestion();
  }

  function buildSessionQuestions() {
    const selectedTopics = state.config.topics;

    const topicFiltered = QUESTION_BANK.filter((q) => selectedTopics.has(q.topic));
    const diffFiltered = state.config.difficulty === 'mixed'
      ? topicFiltered
      : topicFiltered.filter((q) => q.difficulty === state.config.difficulty);

    const shuffled = shuffleArray(diffFiltered);
    const requested = state.config.count;

    if (shuffled.length >= requested) {
      return shuffled.slice(0, requested);
    }

    const fallbackPool = shuffleArray(topicFiltered.filter((q) => !shuffled.some((pick) => pick.id === q.id)));
    return [...shuffled, ...fallbackPool].slice(0, requested);
  }

  function renderQuestion() {
    const question = currentQuestion();
    const response = currentResponse();

    updateQuizMeta(question);

    els.qType.textContent = questionTypeLabel(question.type);
    els.qText.textContent = question.prompt;
    els.qContext.textContent = question.context || '';

    els.answerArea.innerHTML = '';
    renderAnswerWidget(question, response);

    els.feedbackArea.classList.toggle('hidden', !response.submitted);
    if (response.submitted) {
      renderFeedback(response.correct, question.explanation);
    }

    els.prevBtn.disabled = state.quiz.currentIndex === 0;
    els.checkBtn.classList.toggle('hidden', response.submitted);
    els.nextBtn.classList.toggle('hidden', !response.submitted);
  }

  function renderAnswerWidget(question, response) {
    if (question.type === 'mcq') {
      renderMcq(question, response);
      return;
    }
    if (question.type === 'multi') {
      renderMultiSelect(question, response);
      return;
    }
    if (question.type === 'short') {
      renderShortAnswer(question, response);
      return;
    }
    if (question.type === 'matching') {
      renderMatching(question, response);
      return;
    }
    if (question.type === 'sequence') {
      renderSequence(question, response);
      return;
    }
  }

  function renderMcq(question, response) {
    const stored = response.answerPayload?.selected || null;

    question.choices.forEach((choice, idx) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-card';
      button.dataset.value = choice;
      button.dataset.index = String(idx + 1);
      button.innerHTML = `<span class="option-index">${idx + 1}</span><span>${choice}</span>`;

      if (stored === choice) {
        button.classList.add('selected');
      }

      if (response.submitted) {
        button.disabled = true;
        if (choice === question.answer) {
          button.classList.add('correct');
        } else if (stored === choice && choice !== question.answer) {
          button.classList.add('incorrect');
        }
      } else {
        button.addEventListener('click', () => {
          els.answerArea.querySelectorAll('.option-card').forEach((el) => el.classList.remove('selected'));
          button.classList.add('selected');
        });
      }

      els.answerArea.appendChild(button);
    });
  }

  function renderMultiSelect(question, response) {
    const stored = new Set(response.answerPayload?.selected || []);

    question.choices.forEach((choice, idx) => {
      const row = document.createElement('label');
      row.className = 'check-row';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = choice;
      input.checked = stored.has(choice);
      input.disabled = response.submitted;

      const text = document.createElement('span');
      text.textContent = `${idx + 1}. ${choice}`;

      row.appendChild(input);
      row.appendChild(text);

      if (response.submitted) {
        const isCorrectChoice = question.answers.includes(choice);
        if (isCorrectChoice) {
          row.classList.add('correct');
        }
        if (stored.has(choice) && !isCorrectChoice) {
          row.classList.add('incorrect');
        }
      }

      els.answerArea.appendChild(row);
    });
  }

  function renderShortAnswer(question, response) {
    const input = document.createElement('textarea');
    input.className = 'short-input';
    input.rows = 3;
    input.placeholder = 'Type your answer here...';
    input.value = response.answerPayload?.text || '';

    if (response.submitted) {
      input.disabled = true;
      input.classList.add(response.correct ? 'correct' : 'incorrect');
    }

    els.answerArea.appendChild(input);

    if (response.submitted && !response.correct) {
      const note = document.createElement('p');
      note.className = 'answer-note';
      note.textContent = `Expected idea: ${question.answers[0]}`;
      els.answerArea.appendChild(note);
    }
  }

  function renderMatching(question, response) {
    const rightChoices = shuffleArray(question.pairs.map((pair) => pair.right));
    const stored = response.answerPayload?.matches || {};

    question.pairs.forEach((pair) => {
      const row = document.createElement('div');
      row.className = 'match-row';

      const left = document.createElement('span');
      left.className = 'match-left';
      left.textContent = pair.left;

      const select = document.createElement('select');
      select.className = 'match-select';
      select.dataset.left = pair.left;

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Select match...';
      select.appendChild(placeholder);

      rightChoices.forEach((choice) => {
        const option = document.createElement('option');
        option.value = choice;
        option.textContent = choice;
        select.appendChild(option);
      });

      if (stored[pair.left]) {
        select.value = stored[pair.left];
      }

      if (response.submitted) {
        select.disabled = true;
        if (stored[pair.left] === pair.right) {
          select.classList.add('correct');
        } else {
          select.classList.add('incorrect');
        }
      }

      row.appendChild(left);
      row.appendChild(select);
      els.answerArea.appendChild(row);
    });
  }

  function renderSequence(question, response) {
    const sequence = response.answerPayload?.order || shuffleArray(question.items);

    const wrapper = document.createElement('div');
    wrapper.className = 'sequence-list';

    sequence.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'sequence-row';

      const label = document.createElement('span');
      label.textContent = `${index + 1}. ${item}`;

      const controls = document.createElement('div');
      controls.className = 'sequence-controls';

      const up = document.createElement('button');
      up.type = 'button';
      up.textContent = 'Up';
      up.disabled = response.submitted || index === 0;

      const down = document.createElement('button');
      down.type = 'button';
      down.textContent = 'Down';
      down.disabled = response.submitted || index === sequence.length - 1;

      up.addEventListener('click', () => {
        const next = [...sequence];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        currentResponse().answerPayload = { order: next };
        renderQuestion();
      });

      down.addEventListener('click', () => {
        const next = [...sequence];
        [next[index + 1], next[index]] = [next[index], next[index + 1]];
        currentResponse().answerPayload = { order: next };
        renderQuestion();
      });

      controls.appendChild(up);
      controls.appendChild(down);
      row.appendChild(label);
      row.appendChild(controls);
      wrapper.appendChild(row);
    });

    if (response.submitted) {
      wrapper.classList.add(response.correct ? 'correct' : 'incorrect');
      if (!response.correct) {
        const solution = document.createElement('p');
        solution.className = 'answer-note';
        solution.textContent = `Suggested order: ${question.correctOrder.join(' -> ')}`;
        els.answerArea.appendChild(solution);
      }
    }

    els.answerArea.appendChild(wrapper);
  }

  function checkCurrentQuestion() {
    const question = currentQuestion();
    const response = currentResponse();
    if (response.submitted) {
      return;
    }

    const payload = collectAnswerPayload(question);
    if (!payload) {
      return;
    }

    const isCorrect = evaluate(question, payload);
    const weight = questionWeight(question);

    response.submitted = true;
    response.correct = isCorrect;
    response.answerPayload = payload;
    response.scoreWeight = weight;

    state.quiz.topicStats[question.topic].total += 1;
    if (isCorrect) {
      state.quiz.scorePoints += weight;
      state.quiz.topicStats[question.topic].correct += 1;
    }

    renderFeedback(isCorrect, question.explanation);
    renderQuestion();
  }

  function collectAnswerPayload(question) {
    if (question.type === 'mcq') {
      const selected = els.answerArea.querySelector('.option-card.selected');
      if (!selected) {
        alert('Select one option.');
        return null;
      }
      return { selected: selected.dataset.value };
    }

    if (question.type === 'multi') {
      const selected = Array.from(els.answerArea.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
      if (!selected.length) {
        alert('Select at least one option.');
        return null;
      }
      return { selected };
    }

    if (question.type === 'short') {
      const text = els.answerArea.querySelector('textarea').value.trim();
      if (!text) {
        alert('Enter a short answer.');
        return null;
      }
      return { text };
    }

    if (question.type === 'matching') {
      const matches = {};
      const selects = Array.from(els.answerArea.querySelectorAll('select'));
      for (const select of selects) {
        if (!select.value) {
          alert('Complete all matches.');
          return null;
        }
        matches[select.dataset.left] = select.value;
      }
      return { matches };
    }

    if (question.type === 'sequence') {
      const existing = currentResponse().answerPayload?.order;
      const order = existing || Array.from(els.answerArea.querySelectorAll('.sequence-row span')).map((rowText) => rowText.textContent.replace(/^\d+\.\s/, ''));
      return { order };
    }

    return null;
  }

  function evaluate(question, payload) {
    if (question.type === 'mcq') {
      return payload.selected === question.answer;
    }

    if (question.type === 'multi') {
      const picked = [...payload.selected].sort();
      const expected = [...question.answers].sort();
      return picked.length === expected.length && picked.every((value, idx) => value === expected[idx]);
    }

    if (question.type === 'short') {
      const normalized = normalize(payload.text);
      return question.answers.some((answer) => normalized.includes(normalize(answer)) || normalize(answer).includes(normalized));
    }

    if (question.type === 'matching') {
      return question.pairs.every((pair) => payload.matches[pair.left] === pair.right);
    }

    if (question.type === 'sequence') {
      return question.correctOrder.every((item, idx) => payload.order[idx] === item);
    }

    return false;
  }

  function renderFeedback(correct, explanation) {
    els.feedbackArea.classList.remove('hidden');
    els.feedbackArea.classList.toggle('correct', correct);
    els.feedbackArea.classList.toggle('incorrect', !correct);
    els.feedbackTitle.textContent = correct ? 'Correct' : 'Not quite';
    els.feedbackBody.textContent = explanation;
  }

  function nextQuestion() {
    if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
      state.quiz.currentIndex += 1;
      renderQuestion();
      return;
    }

    finishQuiz();
  }

  function prevQuestion() {
    if (state.quiz.currentIndex === 0) {
      return;
    }
    state.quiz.currentIndex -= 1;
    renderQuestion();
  }

  function finishQuiz() {
    const percentage = Math.round((state.quiz.scorePoints / Math.max(1, state.quiz.possiblePoints)) * 100);
    const correctCount = state.quiz.responses.filter((r) => r.correct).length;

    if (percentage >= 80) {
      state.streak += 1;
      localStorage.setItem('flight-lab-streak', String(state.streak));
      els.streakDisplay.textContent = String(state.streak);
    }

    const guidance = percentage >= 85
      ? 'Strong session. Next step: increase scenario difficulty and reduce prompts.'
      : percentage >= 65
        ? 'Good base. Re-fly weak topics and repeat with medium/scenario questions.'
        : 'Focus on one topic at a time, then rebuild to mixed sessions.';

    els.finalScore.textContent = `${percentage}%`;
    els.finalSummary.textContent = `${correctCount} / ${state.quiz.questions.length} correct | ${state.quiz.scorePoints} / ${state.quiz.possiblePoints} weighted points`;
    els.finalGuidance.textContent = guidance;

    renderTopicPerformance();
    renderMissedReview();

    switchView('results');
    updateSessionLabel();
  }

  function renderTopicPerformance() {
    const stats = state.quiz.topicStats;
    const topicRows = Object.keys(stats).sort();

    els.topicPerformance.innerHTML = '';

    topicRows.forEach((topic) => {
      const { correct, total } = stats[topic];
      const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

      const row = document.createElement('div');
      row.className = 'topic-row';
      row.innerHTML = `
        <div class="topic-row-head">
          <span>${topic}</span>
          <strong>${pct}%</strong>
        </div>
        <div class="topic-row-bar"><span style="width:${pct}%"></span></div>
      `;
      els.topicPerformance.appendChild(row);
    });

    state.lastWeakTopics = topicRows.filter((topic) => {
      const { correct, total } = stats[topic];
      if (total === 0) {
        return false;
      }
      return (correct / total) < 0.7;
    });
  }

  function renderMissedReview() {
    els.missedReview.innerHTML = '';

    const missed = state.quiz.questions
      .map((question, index) => ({ question, response: state.quiz.responses[index] }))
      .filter(({ response }) => !response.correct);

    if (!missed.length) {
      const clean = document.createElement('p');
      clean.textContent = 'No misses this flight. Increase difficulty or reduce question prompts for the next round.';
      els.missedReview.appendChild(clean);
      return;
    }

    missed.forEach(({ question, response }) => {
      const card = document.createElement('article');
      card.className = 'missed-card';
      card.innerHTML = `
        <p class="missed-topic">${question.topic} • ${questionTypeLabel(question.type)}</p>
        <h4>${question.prompt}</h4>
        <p><strong>Your answer:</strong> ${stringifyAnswer(response.answerPayload)}</p>
        <p><strong>Coach note:</strong> ${question.explanation}</p>
      `;
      els.missedReview.appendChild(card);
    });
  }

  function retryWeakTopics() {
    if (!state.lastWeakTopics.length) {
      alert('No weak topics detected in the last session. You can still start a new mixed session.');
      return;
    }

    state.config.topics = new Set(state.lastWeakTopics);
    state.config.difficulty = 'mixed';

    syncTopicButtons();

    els.difficultyButtons.forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.difficulty === 'mixed');
    });

    switchView('config');
    updateSessionLabel();
  }

  function syncTopicButtons() {
    const allTopics = uniqueTopics();
    const allSelected = state.config.topics.size === allTopics.length;

    els.topicSelection.querySelectorAll('.topic-btn').forEach((btn) => {
      const topic = btn.dataset.topic;
      if (topic === 'all') {
        btn.classList.toggle('selected', allSelected);
      } else {
        btn.classList.toggle('selected', !allSelected && state.config.topics.has(topic));
      }
    });
  }

  function updateQuizMeta(question) {
    const total = state.quiz.questions.length;
    const current = state.quiz.currentIndex + 1;
    const progress = Math.round((state.quiz.currentIndex / total) * 100);

    els.progress.style.width = `${progress}%`;
    els.topicTag.textContent = question.topic;
    els.difficultyTag.textContent = difficultyLabel(question.difficulty);
    els.qIndex.textContent = `${current}/${total}`;
  }

  function updateCountCopy() {
    els.countCopy.textContent = `${state.config.count} questions`;
  }

  function updateSessionLabel() {
    if (state.view === 'quiz') {
      els.sessionModeDisplay.textContent = 'In flight';
    } else if (state.view === 'results') {
      els.sessionModeDisplay.textContent = 'Debrief';
    } else {
      els.sessionModeDisplay.textContent = 'Briefing';
    }
  }

  function loadStreak() {
    const stored = Number(localStorage.getItem('flight-lab-streak') || '0');
    state.streak = Number.isFinite(stored) ? stored : 0;
    els.streakDisplay.textContent = String(state.streak);
  }

  function handleKeyboardShortcuts(event) {
    if (state.view !== 'quiz') {
      return;
    }

    const response = currentResponse();
    if (event.key === 'Enter') {
      if (!response.submitted) {
        checkCurrentQuestion();
      } else {
        nextQuestion();
      }
      return;
    }

    if (currentQuestion().type !== 'mcq' || response.submitted) {
      return;
    }

    const number = Number(event.key);
    if (!Number.isInteger(number) || number < 1 || number > 9) {
      return;
    }

    const option = els.answerArea.querySelector(`.option-card[data-index="${number}"]`);
    if (option) {
      option.click();
    }
  }

  function switchView(view) {
    Object.entries(els.views).forEach(([name, element]) => {
      element.classList.toggle('hidden-view', name !== view);
      element.classList.toggle('active-view', name === view);
    });
    state.view = view;
  }

  function currentQuestion() {
    return state.quiz.questions[state.quiz.currentIndex];
  }

  function currentResponse() {
    return state.quiz.responses[state.quiz.currentIndex];
  }

  function buildTopicStats(questions) {
    return questions.reduce((stats, question) => {
      if (!stats[question.topic]) {
        stats[question.topic] = { correct: 0, total: 0 };
      }
      return stats;
    }, {});
  }

  function uniqueTopics() {
    return [...new Set(QUESTION_BANK.map((q) => q.topic))].sort();
  }

  function questionWeight(question) {
    return DIFFICULTY_POINTS[question.difficulty] || 1;
  }

  function difficultyLabel(difficulty) {
    if (difficulty === 'easy') return 'Foundation';
    if (difficulty === 'medium') return 'Application';
    return 'Scenario';
  }

  function questionTypeLabel(type) {
    if (type === 'mcq') return 'Single Choice';
    if (type === 'multi') return 'Multi Select';
    if (type === 'short') return 'Short Answer';
    if (type === 'matching') return 'Matching';
    if (type === 'sequence') return 'Order / Flow';
    return type;
  }

  function stringifyAnswer(payload) {
    if (!payload) return 'No answer recorded';
    if (payload.selected) return Array.isArray(payload.selected) ? payload.selected.join(', ') : payload.selected;
    if (payload.text) return payload.text;
    if (payload.matches) return Object.entries(payload.matches).map(([k, v]) => `${k} -> ${v}`).join('; ');
    if (payload.order) return payload.order.join(' -> ');
    return JSON.stringify(payload);
  }

  function normalize(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function exposeTestingHooks() {
    window.render_game_to_text = () => {
      const current = state.view === 'quiz' ? currentQuestion() : null;
      const payload = {
        mode: state.view,
        coordinate_system: 'No 2D game coordinates; DOM-based quiz UI.',
        config: {
          topics: [...state.config.topics],
          difficulty: state.config.difficulty,
          count: state.config.count
        },
        quiz: {
          index: state.quiz.currentIndex,
          total: state.quiz.questions.length,
          scorePoints: state.quiz.scorePoints,
          possiblePoints: state.quiz.possiblePoints,
          currentQuestion: current ? {
            id: current.id,
            topic: current.topic,
            type: current.type,
            difficulty: current.difficulty,
            prompt: current.prompt
          } : null
        }
      };
      return JSON.stringify(payload);
    };

    window.advanceTime = () => {
      return true;
    };
  }
});

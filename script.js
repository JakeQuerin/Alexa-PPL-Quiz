document.addEventListener('DOMContentLoaded', () => {
  const DIFFICULTY_POINTS = { easy: 1, medium: 2, hard: 3 };
  const DAY_MS = 24 * 60 * 60 * 1000;
  const STORAGE_KEYS = {
    streak: 'flight-lab-streak',
    history: 'flight-lab-history-v2',
    srs: 'flight-lab-srs-v2'
  };

  const state = {
    view: 'config',
    mode: 'quiz',
    config: {
      topics: new Set(),
      difficulty: 'mixed',
      count: 12,
      stagePreset: 'custom',
      lessonFocus: 'mixed',
      spacedRepetition: true,
      includeScenarios: true,
      semanticScoring: true
    },
    quiz: {
      questions: [],
      responses: [],
      currentIndex: 0,
      scorePoints: 0,
      possiblePoints: 0,
      topicStats: {},
      repeatedIds: new Set()
    },
    oral: {
      questions: [],
      index: 0,
      secondsLeft: 20,
      timerId: null,
      revealed: false,
      results: [],
      topicStats: {}
    },
    streak: 0,
    history: [],
    srs: {},
    lastWeakTopics: []
  };

  const els = {
    views: {
      config: document.getElementById('view-config'),
      quiz: document.getElementById('view-quiz'),
      oral: document.getElementById('view-oral'),
      results: document.getElementById('view-results')
    },
    streakDisplay: document.getElementById('streak-display'),
    sessionModeDisplay: document.getElementById('session-mode-display'),

    topicSelection: document.getElementById('topic-selection'),
    difficultyButtons: Array.from(document.querySelectorAll('#difficulty-selection .pill-btn')),
    countInput: document.getElementById('question-count'),
    countCopy: document.getElementById('question-count-copy'),
    stageSelect: document.getElementById('stage-select'),
    lessonFocusSelect: document.getElementById('lesson-focus-select'),
    sessionTypeButtons: Array.from(document.querySelectorAll('#session-type-selection .pill-btn')),
    spacedToggle: document.getElementById('spaced-toggle'),
    scenarioToggle: document.getElementById('scenario-toggle'),
    semanticToggle: document.getElementById('semantic-toggle'),
    generateSmartBtn: document.getElementById('generate-smart-btn'),
    smartPlanOutput: document.getElementById('smart-plan-output'),
    startBtn: document.getElementById('start-btn'),

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
    feedbackShortScore: document.getElementById('feedback-short-score'),
    cockpitCard: document.getElementById('cockpit-card'),
    cockpitText: document.getElementById('cockpit-card-text'),

    prevBtn: document.getElementById('prev-btn'),
    checkBtn: document.getElementById('check-btn'),
    nextBtn: document.getElementById('next-btn'),
    quitBtn: document.getElementById('quit-btn'),

    oralIndex: document.getElementById('oral-index'),
    oralTimer: document.getElementById('oral-timer'),
    oralQuestion: document.getElementById('oral-question'),
    oralContext: document.getElementById('oral-context'),
    oralExpected: document.getElementById('oral-expected'),
    oralRevealBtn: document.getElementById('oral-reveal-btn'),
    oralCorrectBtn: document.getElementById('oral-correct-btn'),
    oralWrongBtn: document.getElementById('oral-wrong-btn'),
    oralNextBtn: document.getElementById('oral-next-btn'),
    oralQuitBtn: document.getElementById('oral-quit-btn'),

    finalScore: document.getElementById('final-score'),
    finalSummary: document.getElementById('final-summary'),
    finalGuidance: document.getElementById('final-guidance'),
    topicPerformance: document.getElementById('topic-performance'),
    missedReview: document.getElementById('missed-review'),
    historyDashboard: document.getElementById('history-dashboard'),
    reviewQueueSummary: document.getElementById('review-queue-summary'),
    restartBtn: document.getElementById('restart-btn'),
    retryWeakBtn: document.getElementById('retry-weak-btn')
  };

  init();

  function init() {
    loadPersistentState();
    populateStageSelect();
    populateLessonFocusSelect();
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

    els.sessionTypeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        els.sessionTypeButtons.forEach((b) => b.classList.remove('selected'));
        button.classList.add('selected');
        state.mode = button.dataset.mode;
      });
    });

    els.countInput.addEventListener('input', () => {
      state.config.count = Number(els.countInput.value);
      updateCountCopy();
    });

    els.stageSelect.addEventListener('change', () => {
      state.config.stagePreset = els.stageSelect.value;
      applyStagePreset(state.config.stagePreset);
    });

    els.lessonFocusSelect.addEventListener('change', () => {
      state.config.lessonFocus = els.lessonFocusSelect.value;
    });

    els.spacedToggle.addEventListener('change', () => {
      state.config.spacedRepetition = els.spacedToggle.checked;
    });

    els.scenarioToggle.addEventListener('change', () => {
      state.config.includeScenarios = els.scenarioToggle.checked;
    });

    els.semanticToggle.addEventListener('change', () => {
      state.config.semanticScoring = els.semanticToggle.checked;
    });

    els.generateSmartBtn.addEventListener('click', generateSmartPlan);
    els.startBtn.addEventListener('click', startSession);

    els.prevBtn.addEventListener('click', prevQuestion);
    els.checkBtn.addEventListener('click', checkCurrentQuestion);
    els.nextBtn.addEventListener('click', nextQuestion);
    els.quitBtn.addEventListener('click', resetToConfig);

    els.oralRevealBtn.addEventListener('click', revealOralAnswer);
    els.oralCorrectBtn.addEventListener('click', () => markOral(true));
    els.oralWrongBtn.addEventListener('click', () => markOral(false));
    els.oralNextBtn.addEventListener('click', nextOralQuestion);
    els.oralQuitBtn.addEventListener('click', () => {
      stopOralTimer();
      resetToConfig();
    });

    els.restartBtn.addEventListener('click', resetToConfig);
    els.retryWeakBtn.addEventListener('click', retryWeakTopics);

    document.addEventListener('keydown', handleKeyboardShortcuts);
  }

  function loadPersistentState() {
    state.streak = toNumber(localStorage.getItem(STORAGE_KEYS.streak), 0);
    state.history = parseJSON(localStorage.getItem(STORAGE_KEYS.history), []);
    state.srs = parseJSON(localStorage.getItem(STORAGE_KEYS.srs), {});
    els.streakDisplay.textContent = String(state.streak);
  }

  function persistHistory() {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history.slice(-40)));
  }

  function persistSrs() {
    localStorage.setItem(STORAGE_KEYS.srs, JSON.stringify(state.srs));
  }

  function populateStageSelect() {
    els.stageSelect.innerHTML = '';
    STAGE_PRESETS.forEach((preset) => {
      const opt = document.createElement('option');
      opt.value = preset.id;
      opt.textContent = preset.label;
      els.stageSelect.appendChild(opt);
    });
    els.stageSelect.value = 'custom';
  }

  function populateLessonFocusSelect() {
    els.lessonFocusSelect.innerHTML = '';
    LESSON_FOCUS_OPTIONS.forEach((focus) => {
      const opt = document.createElement('option');
      opt.value = focus.id;
      opt.textContent = focus.label;
      els.lessonFocusSelect.appendChild(opt);
    });
    els.lessonFocusSelect.value = 'mixed';
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
    state.config.stagePreset = 'custom';
    els.stageSelect.value = 'custom';
  }

  function applyStagePreset(presetId) {
    const preset = STAGE_PRESETS.find((entry) => entry.id === presetId);
    if (!preset || preset.id === 'custom') {
      return;
    }

    state.config.topics = new Set(preset.topics);
    state.config.difficulty = preset.difficulty;
    state.config.count = preset.count;

    els.countInput.value = String(preset.count);
    updateCountCopy();
    syncTopicButtons();
    els.difficultyButtons.forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.difficulty === preset.difficulty);
    });

    els.smartPlanOutput.textContent = `Stage preset loaded: ${preset.label}. ${preset.note}`;
  }

  function generateSmartPlan() {
    const focus = LESSON_FOCUS_OPTIONS.find((item) => item.id === state.config.lessonFocus);
    const weakTopics = deriveWeakTopicsFromHistory();
    const dueTopics = deriveDueTopicsFromSrs();

    const smartTopics = new Set([
      ...(focus ? focus.topicBias : []),
      ...weakTopics.slice(0, 3),
      ...dueTopics.slice(0, 2)
    ]);

    if (smartTopics.size === 0) {
      uniqueTopics().forEach((topic) => smartTopics.add(topic));
    }

    state.config.topics = smartTopics;
    state.config.count = Math.min(24, Math.max(12, smartTopics.size * 4));
    state.config.difficulty = smartDifficulty();
    state.config.spacedRepetition = true;

    els.countInput.value = String(state.config.count);
    els.spacedToggle.checked = true;
    els.difficultyButtons.forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.difficulty === state.config.difficulty);
    });

    state.config.stagePreset = 'custom';
    els.stageSelect.value = 'custom';
    syncTopicButtons();
    updateCountCopy();

    const dueCount = dueQuestionIds().length;
    els.smartPlanOutput.textContent = `Smart plan ready: ${state.config.count} questions, ${state.config.difficulty} difficulty, focus on ${[...smartTopics].join(', ')}. ${dueCount} spaced-review item(s) due.`;
  }

  function smartDifficulty() {
    const recent = state.history.slice(-4);
    if (!recent.length) {
      return 'mixed';
    }
    const avg = recent.reduce((sum, entry) => sum + entry.percentage, 0) / recent.length;
    if (avg >= 85) return 'hard';
    if (avg >= 70) return 'medium';
    return 'mixed';
  }

  function startSession() {
    if (state.mode === 'oral') {
      startOralSession();
    } else {
      startQuizSession();
    }
  }

  function startQuizSession() {
    const sessionQuestions = buildQuizSessionQuestions();
    if (!sessionQuestions.length) {
      alert('No questions available for this setup. Try mixed difficulty or all topics.');
      return;
    }

    state.quiz.questions = sessionQuestions;
    state.quiz.responses = sessionQuestions.map(() => ({
      submitted: false,
      correct: false,
      answerPayload: null,
      scoreWeight: 0,
      detail: null,
      scenarioState: null,
      stepCoach: null,
      accounted: false
    }));
    state.quiz.currentIndex = 0;
    state.quiz.scorePoints = 0;
    state.quiz.possiblePoints = sessionQuestions.reduce((sum, q) => sum + questionWeight(q), 0);
    state.quiz.topicStats = buildTopicStats(sessionQuestions);
    state.quiz.repeatedIds = new Set();

    switchView('quiz');
    updateSessionLabel();
    renderQuestion();
  }

  function startOralSession() {
    const pool = buildFilteredPool().filter((q) => q.type !== 'scenario');
    const oralQuestions = shuffleArray(pool).slice(0, Math.min(state.config.count, pool.length));

    if (!oralQuestions.length) {
      alert('No oral prompts available for this setup.');
      return;
    }

    state.oral.questions = oralQuestions;
    state.oral.index = 0;
    state.oral.secondsLeft = 20;
    state.oral.revealed = false;
    state.oral.results = [];
    state.oral.topicStats = buildTopicStats(oralQuestions);

    switchView('oral');
    updateSessionLabel();
    renderOralQuestion();
  }

  function buildQuizSessionQuestions() {
    const pool = buildFilteredPool();
    const count = state.config.count;
    const selected = [];

    if (state.config.spacedRepetition) {
      const due = dueQuestionsFromPool(pool);
      const dueCap = Math.min(due.length, Math.max(2, Math.floor(count * 0.4)));
      selected.push(...due.slice(0, dueCap));
    }

    const pickedIds = new Set(selected.map((q) => baseQuestionId(q)));
    const normalPool = shuffleArray(pool.filter((q) => !pickedIds.has(baseQuestionId(q))));
    for (const question of normalPool) {
      if (selected.length >= count) break;
      selected.push(question);
    }

    if (selected.length < count) {
      selected.push(...shuffleArray(pool).slice(0, count - selected.length));
    }

    return selected.slice(0, count).map((question, idx) => {
      const clone = cloneQuestion(question);
      clone.__sessionId = `${baseQuestionId(question)}__${Date.now()}__${idx}`;
      return clone;
    });
  }

  function buildFilteredPool() {
    const combined = [...QUESTION_BANK, ...(state.config.includeScenarios ? SCENARIO_DRILLS : [])];

    return combined.filter((q) => {
      const topicOk = state.config.topics.has(q.topic);
      const diffOk = state.config.difficulty === 'mixed' || q.difficulty === state.config.difficulty;
      return topicOk && diffOk;
    });
  }

  function dueQuestionIds() {
    const now = Date.now();
    return Object.entries(state.srs)
      .filter(([, rec]) => rec && Number(rec.dueAt) <= now)
      .map(([id]) => id);
  }

  function dueQuestionsFromPool(pool) {
    const dueSet = new Set(dueQuestionIds());
    return pool.filter((q) => dueSet.has(baseQuestionId(q)));
  }

  function renderQuestion() {
    const question = currentQuestion();
    if (!question) {
      finishQuizSession();
      return;
    }

    const response = currentResponse();
    updateQuizMeta(question);

    els.qType.textContent = questionTypeLabel(question.type);
    els.qText.textContent = question.prompt;
    els.qContext.textContent = question.context || '';

    els.answerArea.innerHTML = '';
    renderAnswerWidget(question, response);

    const showFeedback = response.submitted || Boolean(response.stepCoach);
    els.feedbackArea.classList.toggle('hidden', !showFeedback);
    if (showFeedback) {
      const body = response.submitted ? question.explanation : response.stepCoach;
      renderFeedback(response.submitted ? response.correct : null, body, response.detail);
    }

    if (response.submitted) {
      const cockpitTip = question.cockpitTip || COCKPIT_TIP_BY_TOPIC[question.topic] || 'Translate this concept to a clear trigger-action phrase you can execute in flight.';
      els.cockpitCard.classList.remove('hidden');
      els.cockpitText.textContent = cockpitTip;
    } else {
      els.cockpitCard.classList.add('hidden');
      els.cockpitText.textContent = '';
    }

    els.prevBtn.disabled = state.quiz.currentIndex === 0;
    els.checkBtn.classList.toggle('hidden', response.submitted);
    els.nextBtn.classList.toggle('hidden', !response.submitted);

    if (!response.submitted && question.type === 'scenario') {
      els.checkBtn.textContent = 'Commit Decision';
    } else {
      els.checkBtn.textContent = 'Check Answer';
    }

    animateQuestionEntrance();
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
    if (question.type === 'scenario') {
      renderScenario(question, response);
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
        if (isCorrectChoice) row.classList.add('correct');
        if (stored.has(choice) && !isCorrectChoice) row.classList.add('incorrect');
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
  }

  function renderMatching(question, response) {
    const stored = response.answerPayload?.matches || {};
    const rightChoices = response.answerPayload?.__rightChoices || shuffleArray(question.pairs.map((pair) => pair.right));

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

    els.answerArea.appendChild(wrapper);
  }

  function renderScenario(question, response) {
    const scenarioState = response.scenarioState || {
      nodeId: question.startNode,
      score: 0,
      path: []
    };

    const node = question.nodes[scenarioState.nodeId];
    if (!node) {
      return;
    }

    els.qContext.textContent = `${question.context || ''} ${node.prompt || ''}`.trim();

    const selected = response.answerPayload?.selected || null;

    node.choices.forEach((choice, idx) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-card';
      button.dataset.value = choice.id;
      button.dataset.index = String(idx + 1);
      button.innerHTML = `<span class="option-index">${idx + 1}</span><span>${choice.text}</span>`;

      if (selected === choice.id) {
        button.classList.add('selected');
      }

      if (response.submitted) {
        button.disabled = true;
      } else {
        button.addEventListener('click', () => {
          els.answerArea.querySelectorAll('.option-card').forEach((el) => el.classList.remove('selected'));
          button.classList.add('selected');
        });
      }

      els.answerArea.appendChild(button);
    });
  }

  async function checkCurrentQuestion() {
    const question = currentQuestion();
    const response = currentResponse();

    if (response.submitted) {
      return;
    }

    const payload = collectAnswerPayload(question);
    if (!payload) {
      return;
    }

    if (question.type === 'scenario') {
      processScenarioStep(question, response, payload);
      return;
    }

    const evaluation = await evaluateQuestion(question, payload);
    finalizeQuestion(question, response, payload, evaluation);
  }

  function processScenarioStep(question, response, payload) {
    const scenarioState = response.scenarioState || { nodeId: question.startNode, score: 0, path: [] };
    const node = question.nodes[scenarioState.nodeId];
    const choice = node.choices.find((opt) => opt.id === payload.selected);
    if (!choice) {
      alert('Select one scenario action.');
      return;
    }

    const nextScore = scenarioState.score + toNumber(choice.score, 0);
    const nextPath = [...scenarioState.path, { node: scenarioState.nodeId, choice: choice.id }];
    const nextNode = question.nodes[choice.next];

    response.answerPayload = payload;
    response.stepCoach = choice.coach || 'Decision recorded.';

    if (nextNode && !nextNode.terminal) {
      response.scenarioState = {
        nodeId: choice.next,
        score: nextScore,
        path: nextPath
      };
      renderQuestion();
      return;
    }

    const maxScore = estimateScenarioMaxScore(question);
    const normalized = maxScore === 0 ? 0 : Math.min(1, nextScore / maxScore);
    const terminalSummary = nextNode?.summary || question.explanation;

    finalizeQuestion(question, response, payload, {
      correct: normalized >= toNumber(question.passScore, 0.65),
      score: normalized,
      detail: {
        method: 'scenario-branching',
        summary: terminalSummary,
        covered: [`Decision score: ${(normalized * 100).toFixed(0)}%`],
        missing: normalized < toNumber(question.passScore, 0.65) ? ['Choose safer gates earlier in the scenario chain.'] : []
      },
      explanationOverride: `${terminalSummary} ${question.explanation}`.trim()
    });
  }

  function finalizeQuestion(question, response, payload, evaluation) {
    response.submitted = true;
    response.correct = evaluation.correct;
    response.answerPayload = payload;
    response.detail = evaluation.detail || null;
    response.scoreWeight = questionWeight(question) * evaluation.score;
    response.stepCoach = null;

    if (!response.accounted) {
      state.quiz.scorePoints += response.scoreWeight;
      state.quiz.topicStats[question.topic].total += 1;
      state.quiz.topicStats[question.topic].points += response.scoreWeight;
      state.quiz.topicStats[question.topic].possible += questionWeight(question);
      if (evaluation.correct) {
        state.quiz.topicStats[question.topic].correct += 1;
      }
      response.accounted = true;
    }

    if (state.config.spacedRepetition) {
      updateSrs(baseQuestionId(question), evaluation.score);
      if (evaluation.score < 0.65) {
        queueImmediateReview(question);
      }
    }

    if (evaluation.explanationOverride) {
      question.explanation = evaluation.explanationOverride;
    }

    renderQuestion();
  }

  function collectAnswerPayload(question) {
    if (question.type === 'mcq' || question.type === 'scenario') {
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
      const rightChoices = [];
      const selects = Array.from(els.answerArea.querySelectorAll('select'));
      for (const select of selects) {
        if (!select.value) {
          alert('Complete all matches.');
          return null;
        }
        matches[select.dataset.left] = select.value;
      }
      selects[0]?.querySelectorAll('option').forEach((opt) => {
        if (opt.value) rightChoices.push(opt.value);
      });
      return { matches, __rightChoices: rightChoices };
    }

    if (question.type === 'sequence') {
      const existing = currentResponse().answerPayload?.order;
      const order = existing || Array.from(els.answerArea.querySelectorAll('.sequence-row span')).map((rowText) => rowText.textContent.replace(/^\d+\.\s/, ''));
      return { order };
    }

    return null;
  }

  async function evaluateQuestion(question, payload) {
    if (question.type === 'mcq') {
      const correct = payload.selected === question.answer;
      return { correct, score: correct ? 1 : 0 };
    }

    if (question.type === 'multi') {
      const expected = new Set(question.answers);
      const got = new Set(payload.selected);
      const intersection = [...got].filter((choice) => expected.has(choice)).length;
      const union = new Set([...expected, ...got]).size;
      const score = union === 0 ? 0 : intersection / union;
      const correct = score === 1;
      return {
        correct,
        score,
        detail: {
          method: 'set-overlap',
          covered: [...got].filter((item) => expected.has(item)),
          missing: [...expected].filter((item) => !got.has(item))
        }
      };
    }

    if (question.type === 'short') {
      return evaluateShortAnswer(question, payload.text);
    }

    if (question.type === 'matching') {
      const total = question.pairs.length;
      const correctMatches = question.pairs.filter((pair) => payload.matches[pair.left] === pair.right).length;
      const score = total === 0 ? 0 : correctMatches / total;
      return {
        correct: score === 1,
        score,
        detail: {
          method: 'matching',
          covered: [`${correctMatches}/${total} matches correct`],
          missing: question.pairs.filter((pair) => payload.matches[pair.left] !== pair.right).map((pair) => `${pair.left} -> ${pair.right}`)
        }
      };
    }

    if (question.type === 'sequence') {
      const total = question.correctOrder.length;
      const correctSlots = question.correctOrder.filter((item, idx) => payload.order[idx] === item).length;
      const score = total === 0 ? 0 : correctSlots / total;
      return {
        correct: score === 1,
        score,
        detail: {
          method: 'order-position',
          covered: [`${correctSlots}/${total} positions correct`],
          missing: score === 1 ? [] : ['Review the sequence logic and trigger order.']
        }
      };
    }

    return { correct: false, score: 0 };
  }

  async function evaluateShortAnswer(question, answerText) {
    const normalized = normalize(answerText);

    if (!state.config.semanticScoring) {
      const exact = (question.answers || []).some((entry) => normalize(entry) === normalized);
      return {
        correct: exact,
        score: exact ? 1 : 0,
        detail: {
          method: 'exact-match',
          covered: exact ? ['Expected phrase matched.'] : [],
          missing: exact ? [] : [question.answers?.[0] || 'Use expected phraseology.']
        }
      };
    }

    if (typeof window.flightLabShortAnswerScorer === 'function') {
      try {
        const external = await window.flightLabShortAnswerScorer({
          question,
          answerText,
          rubric: SHORT_ANSWER_RUBRICS[baseQuestionId(question)] || null
        });
        if (external && typeof external.score === 'number') {
          return {
            correct: typeof external.correct === 'boolean' ? external.correct : external.score >= 0.65,
            score: clamp(external.score, 0, 1),
            detail: {
              method: external.method || 'external-scorer',
              covered: external.covered || [],
              missing: external.missing || [],
              summary: external.feedback || ''
            }
          };
        }
      } catch (error) {
        console.warn('External short-answer scorer failed; falling back to local rubric.', error);
      }
    }

    const rubric = SHORT_ANSWER_RUBRICS[baseQuestionId(question)];
    if (rubric) {
      const covered = [];
      const missing = [];

      rubric.concepts.forEach((concept) => {
        const matched = concept.terms.some((term) => normalized.includes(normalize(term)));
        if (matched) {
          covered.push(concept.label);
        } else {
          missing.push(concept.label);
        }
      });

      const score = rubric.concepts.length ? covered.length / rubric.concepts.length : 0;
      const threshold = toNumber(rubric.threshold, 0.66);
      return {
        correct: score >= threshold,
        score,
        detail: {
          method: 'semantic-rubric',
          covered,
          missing
        }
      };
    }

    const expected = question.answers || [];
    const overlapScores = expected.map((sample) => lexicalOverlap(normalized, normalize(sample)));
    const score = overlapScores.length ? Math.max(...overlapScores) : 0;
    return {
      correct: score >= 0.75,
      score,
      detail: {
        method: 'lexical-overlap',
        covered: score >= 0.75 ? ['Core phrasing captured.'] : [],
        missing: score >= 0.75 ? [] : [expected[0] || 'Add more key idea words.']
      }
    };
  }

  function queueImmediateReview(question) {
    const baseId = baseQuestionId(question);
    if (state.quiz.repeatedIds.has(baseId) || question.isReview) {
      return;
    }

    const original = findQuestionById(baseId);
    if (!original) return;

    const clone = cloneQuestion(original);
    clone.isReview = true;
    clone.sourceId = baseId;
    clone.prompt = `Review Recheck: ${clone.prompt}`;
    clone.context = `Spaced repetition follow-up from this session. ${clone.context || ''}`.trim();
    clone.__sessionId = `${baseId}__review__${Date.now()}`;

    state.quiz.questions.push(clone);
    state.quiz.responses.push({
      submitted: false,
      correct: false,
      answerPayload: null,
      scoreWeight: 0,
      detail: null,
      scenarioState: null,
      stepCoach: null,
      accounted: false
    });
    state.quiz.possiblePoints += questionWeight(clone);

    if (!state.quiz.topicStats[clone.topic]) {
      state.quiz.topicStats[clone.topic] = { total: 0, correct: 0, points: 0, possible: 0 };
    }

    state.quiz.repeatedIds.add(baseId);
  }

  function updateSrs(questionId, score) {
    const now = Date.now();
    const quality = Math.round(clamp(score, 0, 1) * 5);
    const rec = state.srs[questionId] || {
      ease: 2.3,
      intervalDays: 0,
      repetitions: 0,
      dueAt: now
    };

    if (quality < 3) {
      rec.repetitions = 0;
      rec.intervalDays = 0.25;
    } else {
      rec.repetitions += 1;
      if (rec.repetitions === 1) {
        rec.intervalDays = 1;
      } else if (rec.repetitions === 2) {
        rec.intervalDays = 3;
      } else {
        rec.intervalDays = Math.max(1, rec.intervalDays * rec.ease);
      }

      const easeDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
      rec.ease = clamp(rec.ease + easeDelta, 1.3, 2.8);
    }

    rec.dueAt = now + rec.intervalDays * DAY_MS;
    state.srs[questionId] = rec;
    persistSrs();
  }

  function nextQuestion() {
    if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
      state.quiz.currentIndex += 1;
      renderQuestion();
    } else {
      finishQuizSession();
    }
  }

  function prevQuestion() {
    if (state.quiz.currentIndex === 0) return;
    state.quiz.currentIndex -= 1;
    renderQuestion();
  }

  function finishQuizSession() {
    const total = Math.max(1, state.quiz.possiblePoints);
    const percentage = Math.round((state.quiz.scorePoints / total) * 100);
    const correctCount = state.quiz.responses.filter((r) => r.correct).length;

    if (percentage >= 80) {
      state.streak += 1;
      localStorage.setItem(STORAGE_KEYS.streak, String(state.streak));
      els.streakDisplay.textContent = String(state.streak);
    }

    const guidance = percentage >= 85
      ? 'Strong session. Raise challenge with hard scenarios and oral mode before next lesson.'
      : percentage >= 70
        ? 'Solid baseline. Re-fly weak topics and complete due spaced-repetition items.'
        : 'Focus on one stage plan and repeat. Prioritize cockpit trigger/action memory phrases.';

    renderResults({
      mode: 'quiz',
      percentage,
      summary: `${correctCount} / ${state.quiz.questions.length} correct | ${state.quiz.scorePoints.toFixed(1)} / ${state.quiz.possiblePoints.toFixed(1)} weighted points`,
      guidance,
      topicStats: state.quiz.topicStats,
      missed: buildMissedEntries()
    });

    saveHistoryEntry({
      mode: 'quiz',
      percentage,
      count: state.quiz.questions.length,
      stagePreset: state.config.stagePreset,
      lessonFocus: state.config.lessonFocus,
      topicStats: simplifyTopicStats(state.quiz.topicStats)
    });

    switchView('results');
    updateSessionLabel();
  }

  function renderOralQuestion() {
    const current = state.oral.questions[state.oral.index];
    if (!current) {
      finishOralSession();
      return;
    }

    state.oral.revealed = false;
    state.oral.secondsLeft = 20;

    els.oralIndex.textContent = `${state.oral.index + 1}/${state.oral.questions.length}`;
    els.oralQuestion.textContent = current.prompt;
    els.oralContext.textContent = current.context || `${current.topic} • ${difficultyLabel(current.difficulty)}`;
    els.oralExpected.classList.add('hidden');
    els.oralExpected.textContent = '';
    els.oralNextBtn.classList.add('hidden');

    startOralTimer();
    animateQuestionEntrance();
  }

  function startOralTimer() {
    stopOralTimer();
    els.oralTimer.textContent = `${state.oral.secondsLeft}s`;

    state.oral.timerId = window.setInterval(() => {
      state.oral.secondsLeft -= 1;
      els.oralTimer.textContent = `${state.oral.secondsLeft}s`;
      els.oralTimer.classList.toggle('urgent', state.oral.secondsLeft <= 6);
      if (state.oral.secondsLeft <= 0) {
        stopOralTimer();
        revealOralAnswer();
      }
    }, 1000);
  }

  function stopOralTimer() {
    if (state.oral.timerId) {
      window.clearInterval(state.oral.timerId);
      state.oral.timerId = null;
    }
    els.oralTimer.classList.remove('urgent');
  }

  function revealOralAnswer() {
    const current = state.oral.questions[state.oral.index];
    if (!current) return;

    state.oral.revealed = true;
    const expected = expectedOralAnswer(current);
    els.oralExpected.textContent = `Expected: ${expected}`;
    els.oralExpected.classList.remove('hidden');
  }

  function markOral(correct) {
    const current = state.oral.questions[state.oral.index];
    if (!current) return;

    stopOralTimer();
    revealOralAnswer();

    state.oral.results[state.oral.index] = { correct };
    state.oral.topicStats[current.topic].total += 1;
    if (correct) {
      state.oral.topicStats[current.topic].correct += 1;
      state.oral.topicStats[current.topic].points += 1;
    }
    state.oral.topicStats[current.topic].possible += 1;

    els.oralNextBtn.classList.remove('hidden');
  }

  function nextOralQuestion() {
    state.oral.index += 1;
    renderOralQuestion();
  }

  function finishOralSession() {
    stopOralTimer();
    const total = state.oral.questions.length;
    const correct = state.oral.results.filter((entry) => entry?.correct).length;
    const percentage = total ? Math.round((correct / total) * 100) : 0;

    if (percentage >= 80) {
      state.streak += 1;
      localStorage.setItem(STORAGE_KEYS.streak, String(state.streak));
      els.streakDisplay.textContent = String(state.streak);
    }

    renderResults({
      mode: 'oral',
      percentage,
      summary: `${correct} / ${total} oral prompts marked correct`,
      guidance: percentage >= 80
        ? 'Good oral recall pace. Keep responses concise and checklist-oriented.'
        : 'Repeat oral mode with fewer topics and shorter trigger-response phrases.',
      topicStats: state.oral.topicStats,
      missed: []
    });

    saveHistoryEntry({
      mode: 'oral',
      percentage,
      count: total,
      stagePreset: state.config.stagePreset,
      lessonFocus: state.config.lessonFocus,
      topicStats: simplifyTopicStats(state.oral.topicStats)
    });

    switchView('results');
    updateSessionLabel();
  }

  function renderResults(result) {
    els.finalScore.textContent = `${result.percentage}%`;
    els.finalSummary.textContent = result.summary;
    els.finalGuidance.textContent = result.guidance;

    renderTopicPerformance(result.topicStats);
    renderMissedReview(result.missed);
    renderHistoryDashboard();
    renderReviewQueueSummary();
  }

  function renderTopicPerformance(topicStats) {
    els.topicPerformance.innerHTML = '';

    Object.keys(topicStats).sort().forEach((topic) => {
      const rowData = topicStats[topic];
      const denom = Math.max(1, rowData.total);
      const pct = Math.round((rowData.correct / denom) * 100);

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

    state.lastWeakTopics = Object.keys(topicStats).filter((topic) => {
      const rec = topicStats[topic];
      return rec.total > 0 && (rec.correct / rec.total) < 0.7;
    });
  }

  function renderMissedReview(missedEntries) {
    els.missedReview.innerHTML = '';

    if (!missedEntries.length) {
      const clean = document.createElement('p');
      clean.textContent = 'No misses this session. Increase difficulty or run oral rapid-fire next.';
      els.missedReview.appendChild(clean);
      return;
    }

    missedEntries.forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'missed-card';
      card.innerHTML = `
        <p class="missed-topic">${entry.topic} • ${entry.type}</p>
        <h4>${entry.prompt}</h4>
        <p><strong>Your answer:</strong> ${entry.answer}</p>
        <p><strong>Coach note:</strong> ${entry.coach}</p>
      `;
      els.missedReview.appendChild(card);
    });
  }

  function renderHistoryDashboard() {
    els.historyDashboard.innerHTML = '';

    if (!state.history.length) {
      els.historyDashboard.textContent = 'No completed sessions yet.';
      return;
    }

    const recent = state.history.slice(-10);
    const avg = Math.round(recent.reduce((sum, entry) => sum + entry.percentage, 0) / recent.length);

    const summary = document.createElement('p');
    summary.className = 'history-summary';
    summary.textContent = `Last ${recent.length} session average: ${avg}%`;
    els.historyDashboard.appendChild(summary);

    const bars = document.createElement('div');
    bars.className = 'history-bars';

    recent.forEach((entry) => {
      const bar = document.createElement('div');
      bar.className = 'history-bar';
      bar.innerHTML = `
        <span class="history-bar-fill" style="height:${Math.max(8, entry.percentage)}%"></span>
        <small>${entry.percentage}%</small>
      `;
      bars.appendChild(bar);
    });

    els.historyDashboard.appendChild(bars);
  }

  function renderReviewQueueSummary() {
    const due = dueQuestionIds().length;
    const soonest = Object.values(state.srs)
      .map((rec) => Number(rec.dueAt))
      .filter((ts) => Number.isFinite(ts))
      .sort((a, b) => a - b)[0];

    const nextDueText = soonest ? new Date(soonest).toLocaleString() : 'No pending reviews';
    els.reviewQueueSummary.textContent = `${due} item(s) due now. Next due: ${nextDueText}`;
  }

  function saveHistoryEntry(entry) {
    state.history.push({
      ...entry,
      createdAt: new Date().toISOString()
    });
    state.history = state.history.slice(-40);
    persistHistory();
  }

  function buildMissedEntries() {
    return state.quiz.questions
      .map((question, idx) => ({ question, response: state.quiz.responses[idx] }))
      .filter(({ response }) => response.submitted && !response.correct)
      .map(({ question, response }) => ({
        topic: question.topic,
        type: questionTypeLabel(question.type),
        prompt: question.prompt,
        answer: stringifyAnswer(response.answerPayload),
        coach: response.detail?.summary || question.explanation
      }));
  }

  function retryWeakTopics() {
    if (!state.lastWeakTopics.length) {
      alert('No weak topics detected. You can run a smart plan instead.');
      return;
    }

    state.config.topics = new Set(state.lastWeakTopics);
    state.config.difficulty = 'mixed';
    state.mode = 'quiz';

    els.sessionTypeButtons.forEach((button) => {
      button.classList.toggle('selected', button.dataset.mode === 'quiz');
    });
    els.difficultyButtons.forEach((button) => {
      button.classList.toggle('selected', button.dataset.difficulty === 'mixed');
    });

    syncTopicButtons();
    resetToConfig();
  }

  function resetToConfig() {
    stopOralTimer();
    switchView('config');
    updateSessionLabel();
  }

  function updateCountCopy() {
    els.countCopy.textContent = `${state.config.count} questions`;
  }

  function updateQuizMeta(question) {
    const total = state.quiz.questions.length;
    const current = state.quiz.currentIndex + 1;
    const progress = total ? Math.round((state.quiz.currentIndex / total) * 100) : 0;

    els.progress.style.width = `${progress}%`;
    els.topicTag.textContent = question.topic;
    els.difficultyTag.textContent = difficultyLabel(question.difficulty);
    els.qIndex.textContent = `${current}/${total}`;
  }

  function renderFeedback(correct, text, detail) {
    els.feedbackArea.classList.remove('hidden');
    els.feedbackArea.classList.remove('correct', 'incorrect', 'neutral');

    if (correct === null) {
      els.feedbackArea.classList.add('neutral');
      els.feedbackTitle.textContent = 'Scenario Coach';
    } else {
      els.feedbackArea.classList.add(correct ? 'correct' : 'incorrect');
      els.feedbackTitle.textContent = correct ? 'Correct' : 'Needs Work';
    }

    els.feedbackBody.textContent = text;

    if (detail && (detail.covered?.length || detail.missing?.length || detail.method)) {
      const bits = [];
      if (detail.method) bits.push(`Method: ${detail.method}`);
      if (detail.covered?.length) bits.push(`Covered: ${detail.covered.join(', ')}`);
      if (detail.missing?.length) bits.push(`Missing: ${detail.missing.join(', ')}`);
      if (detail.summary) bits.push(`Note: ${detail.summary}`);
      els.feedbackShortScore.textContent = bits.join(' | ');
      els.feedbackShortScore.classList.remove('hidden');
    } else {
      els.feedbackShortScore.classList.add('hidden');
      els.feedbackShortScore.textContent = '';
    }

    els.feedbackArea.classList.remove('feedback-pop');
    window.requestAnimationFrame(() => {
      els.feedbackArea.classList.add('feedback-pop');
    });
  }

  function expectedOralAnswer(question) {
    if (question.type === 'mcq') return question.answer;
    if (question.type === 'multi') return question.answers.join(', ');
    if (question.type === 'short') return (question.answers || [])[0] || 'Core idea phrase';
    if (question.type === 'matching') return question.pairs.map((pair) => `${pair.left} -> ${pair.right}`).join(' | ');
    if (question.type === 'sequence') return question.correctOrder.join(' -> ');
    return question.explanation;
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

  function handleKeyboardShortcuts(event) {
    if (state.view !== 'quiz') return;

    const response = currentResponse();
    const question = currentQuestion();

    if (event.key === 'Enter') {
      if (!response.submitted) {
        checkCurrentQuestion();
      } else {
        nextQuestion();
      }
      return;
    }

    if (!question || (question.type !== 'mcq' && question.type !== 'scenario') || response.submitted) {
      return;
    }

    const num = Number(event.key);
    if (!Number.isInteger(num) || num < 1 || num > 9) return;

    const option = els.answerArea.querySelector(`.option-card[data-index="${num}"]`);
    if (option) option.click();
  }

  function switchView(viewName) {
    Object.entries(els.views).forEach(([name, view]) => {
      view.classList.toggle('hidden-view', name !== viewName);
      view.classList.toggle('active-view', name === viewName);
    });
    const active = els.views[viewName];
    if (active) {
      active.classList.remove('view-swap');
      window.requestAnimationFrame(() => active.classList.add('view-swap'));
    }
    state.view = viewName;
  }

  function animateQuestionEntrance() {
    const shell = document.querySelector('.question-shell');
    if (shell) {
      shell.classList.remove('question-shell-swap');
      window.requestAnimationFrame(() => shell.classList.add('question-shell-swap'));
    }

    const rows = els.answerArea.querySelectorAll('.option-card, .check-row, .match-row, .sequence-row');
    rows.forEach((row, index) => {
      row.style.setProperty('--stagger', String(index));
      row.classList.add('stagger-in');
    });
  }

  function updateSessionLabel() {
    if (state.view === 'quiz') {
      els.sessionModeDisplay.textContent = 'In flight';
    } else if (state.view === 'oral') {
      els.sessionModeDisplay.textContent = 'Oral mode';
    } else if (state.view === 'results') {
      els.sessionModeDisplay.textContent = 'Debrief';
    } else {
      els.sessionModeDisplay.textContent = 'Briefing';
    }
  }

  function currentQuestion() {
    return state.quiz.questions[state.quiz.currentIndex];
  }

  function currentResponse() {
    return state.quiz.responses[state.quiz.currentIndex];
  }

  function deriveWeakTopicsFromHistory() {
    const recent = state.history.slice(-8);
    const topicScores = {};

    recent.forEach((entry) => {
      if (!entry.topicStats) return;
      Object.entries(entry.topicStats).forEach(([topic, stat]) => {
        if (!topicScores[topic]) {
          topicScores[topic] = { points: 0, possible: 0 };
        }
        topicScores[topic].points += toNumber(stat.points, 0);
        topicScores[topic].possible += Math.max(1, toNumber(stat.possible, 0));
      });
    });

    return Object.entries(topicScores)
      .map(([topic, stat]) => ({ topic, score: stat.possible ? stat.points / stat.possible : 0 }))
      .sort((a, b) => a.score - b.score)
      .map((entry) => entry.topic);
  }

  function deriveDueTopicsFromSrs() {
    const dueSet = new Set(dueQuestionIds());
    const dueTopics = new Set();

    QUESTION_BANK.forEach((question) => {
      if (dueSet.has(baseQuestionId(question))) {
        dueTopics.add(question.topic);
      }
    });

    return [...dueTopics];
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
    if (type === 'scenario') return 'Scenario Drill';
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
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function lexicalOverlap(textA, textB) {
    const a = new Set(normalize(textA).split(' ').filter(Boolean));
    const b = new Set(normalize(textB).split(' ').filter(Boolean));
    if (!a.size || !b.size) return 0;
    const shared = [...a].filter((token) => b.has(token)).length;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 0 : shared / union;
  }

  function buildTopicStats(questions) {
    return questions.reduce((stats, question) => {
      if (!stats[question.topic]) {
        stats[question.topic] = { total: 0, correct: 0, points: 0, possible: 0 };
      }
      return stats;
    }, {});
  }

  function simplifyTopicStats(stats) {
    return Object.entries(stats).reduce((acc, [topic, value]) => {
      acc[topic] = {
        total: value.total,
        correct: value.correct,
        points: Number(value.points.toFixed(2)),
        possible: Number(value.possible.toFixed(2))
      };
      return acc;
    }, {});
  }

  function parseJSON(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function cloneQuestion(question) {
    return typeof structuredClone === 'function' ? structuredClone(question) : JSON.parse(JSON.stringify(question));
  }

  function baseQuestionId(question) {
    const source = question.sourceId || question.id || '';
    return String(source).split('__review')[0];
  }

  function findQuestionById(id) {
    return [...QUESTION_BANK, ...SCENARIO_DRILLS].find((question) => question.id === id) || null;
  }

  function estimateScenarioMaxScore(question) {
    const memo = {};

    function dfs(nodeId) {
      if (memo[nodeId] !== undefined) return memo[nodeId];
      const node = question.nodes[nodeId];
      if (!node || node.terminal || !node.choices?.length) {
        memo[nodeId] = 0;
        return 0;
      }
      const best = Math.max(...node.choices.map((choice) => toNumber(choice.score, 0) + dfs(choice.next)));
      memo[nodeId] = best;
      return best;
    }

    return Math.max(1, dfs(question.startNode));
  }

  function exposeTestingHooks() {
    window.render_game_to_text = () => {
      const currentQuiz = state.view === 'quiz' ? currentQuestion() : null;
      const currentOral = state.view === 'oral' ? state.oral.questions[state.oral.index] : null;

      return JSON.stringify({
        mode: state.view,
        coordinate_system: 'No 2D coordinates; DOM-based study app.',
        config: {
          topics: [...state.config.topics],
          difficulty: state.config.difficulty,
          count: state.config.count,
          stagePreset: state.config.stagePreset,
          lessonFocus: state.config.lessonFocus,
          spacedRepetition: state.config.spacedRepetition,
          includeScenarios: state.config.includeScenarios,
          semanticScoring: state.config.semanticScoring,
          sessionMode: state.mode
        },
        quiz: {
          index: state.quiz.currentIndex,
          total: state.quiz.questions.length,
          scorePoints: Number(state.quiz.scorePoints.toFixed(2)),
          possiblePoints: Number(state.quiz.possiblePoints.toFixed(2)),
          currentQuestion: currentQuiz ? {
            id: currentQuiz.id,
            topic: currentQuiz.topic,
            type: currentQuiz.type,
            difficulty: currentQuiz.difficulty,
            prompt: currentQuiz.prompt
          } : null
        },
        oral: {
          index: state.oral.index,
          total: state.oral.questions.length,
          secondsLeft: state.oral.secondsLeft,
          currentPrompt: currentOral ? currentOral.prompt : null
        },
        srsDueNow: dueQuestionIds().length
      });
    };

    window.advanceTime = () => true;
  }
});

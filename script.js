document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    const state = {
        view: 'config', // config, quiz, results
        config: {
            topic: 'all',
            difficulty: 'mixed',
            count: 10
        },
        quiz: {
            questions: [],
            currentIndex: 0,
            score: 0,
            answers: [] // Store user answers: { questionId: "...", attempted: boolean, correct: boolean, userResponse: any }
        },
        streak: 0
    };

    // --- DOM ELEMENTS ---
    const els = {
        views: {
            config: document.getElementById('view-config'),
            quiz: document.getElementById('view-quiz'),
            results: document.getElementById('view-results')
        },
        config: {
            topicGrid: document.getElementById('topic-selection'),
            diffBtns: document.querySelectorAll('.pill-btn'),
            countInput: document.getElementById('question-count'),
            countVal: document.getElementById('q-count-val'),
            startBtn: document.getElementById('start-btn')
        },
        quiz: {
            progress: document.getElementById('quiz-progress'),
            tag: document.getElementById('q-category-tag'),
            number: document.getElementById('q-number'),
            text: document.getElementById('question-text'),
            optionsArea: document.getElementById('options-area'),
            prevBtn: document.getElementById('prev-btn'),
            checkBtn: document.getElementById('check-btn'),
            nextBtn: document.getElementById('next-btn'),
            quitBtn: document.getElementById('quit-btn'),
            feedback: {
                area: document.getElementById('feedback-area'),
                title: document.getElementById('feedback-title'),
                text: document.getElementById('feedback-text')
            }
        },
        results: {
            score: document.getElementById('final-score'),
            subScore: document.getElementById('sub-score'),
            restartBtn: document.getElementById('restart-btn')
        },
        streak: document.getElementById('streak-display')
    };

    // --- INITIALIZATION ---
    init();

    function init() {
        populateTopics();
        setupEventListeners();
        loadStreak();
    }

    // --- LOGIC: CONFIGURATION ---
    function populateTopics() {
        // Extract unique categories
        const categories = [...new Set(questionBank.map(q => q.category))];
        
        // Add "Mix All" button
        els.config.topicGrid.innerHTML = `
            <button class="topic-btn selected" data-topic="all">Mix All Topics</button>
        `;

        categories.sort().forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'topic-btn';
            btn.textContent = cat;
            btn.dataset.topic = cat;
            els.config.topicGrid.appendChild(btn);
        });
    }

    function setupEventListeners() {
        // Topic Selection
        els.config.topicGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('topic-btn')) {
                document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                state.config.topic = e.target.dataset.topic;
            }
        });

        // Difficulty Selection
        els.config.diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                els.config.diffBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                state.config.difficulty = btn.dataset.diff;
            });
        });

        // Question Count
        els.config.countInput.addEventListener('input', (e) => {
            els.config.countVal.textContent = e.target.value;
            state.config.count = parseInt(e.target.value);
        });

        // Start Quiz
        els.config.startBtn.addEventListener('click', startQuiz);

        // Quiz Controls
        els.quiz.checkBtn.addEventListener('click', checkAnswer);
        els.quiz.nextBtn.addEventListener('click', nextQuestion);
        els.quiz.prevBtn.addEventListener('click', prevQuestion);
        els.quiz.quitBtn.addEventListener('click', quitQuiz);
        
        // Restart
        els.results.restartBtn.addEventListener('click', () => switchView('config'));
    }

    function loadStreak() {
        const saved = localStorage.getItem('ppl-streak');
        if (saved) {
            state.streak = parseInt(saved);
            els.streak.textContent = state.streak;
        }
    }

    // --- LOGIC: QUIZ LIFECYCLE ---
    function startQuiz() {
        // Create a copy to avoid mutating the source
        let filtered = [...questionBank];
        
        if (state.config.topic !== 'all') {
            filtered = filtered.filter(q => q.category === state.config.topic);
        }

        if (state.config.difficulty !== 'mixed') {
            filtered = filtered.filter(q => q.difficulty === state.config.difficulty);
        }

        // Shuffle using Fisher-Yates for better randomness
        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }

        // Slice to count
        state.quiz.questions = filtered.slice(0, state.config.count);
        
        if (state.quiz.questions.length === 0) {
            alert("No questions found for this configuration! Try 'Mixed' difficulty.");
            return;
        }

        // Reset Quiz State
        state.quiz.currentIndex = 0;
        state.quiz.score = 0;
        state.quiz.answers = new Array(state.quiz.questions.length).fill(null); // Init answer store

        renderQuestion();
        switchView('quiz');
    }

    function quitQuiz() {
        if(confirm("Are you sure you want to end this flight early? Progress will be lost.")) {
            switchView('config');
        }
    }

    function renderQuestion() {
        const q = state.quiz.questions[state.quiz.currentIndex];
        const total = state.quiz.questions.length;
        const savedAnswer = state.quiz.answers[state.quiz.currentIndex];
        
        // Update Meta
        els.quiz.progress.style.width = `${((state.quiz.currentIndex) / total) * 100}%`;
        els.quiz.tag.textContent = q.category;
        els.quiz.number.textContent = `Q ${state.quiz.currentIndex + 1}/${total}`;
        els.quiz.text.textContent = q.question;

        // Reset UI
        els.quiz.optionsArea.innerHTML = '';
        els.quiz.feedback.area.classList.add('hidden');
        
        // Button Logic
        els.quiz.prevBtn.classList.toggle('hidden', state.quiz.currentIndex === 0);
        
        if (savedAnswer && savedAnswer.attempted) {
             // If already answered, show feedback and next button immediately
             els.quiz.checkBtn.classList.add('hidden');
             els.quiz.nextBtn.classList.remove('hidden');
             showFeedback(savedAnswer.correct, q.explanation);
        } else {
             // Fresh question
             els.quiz.checkBtn.classList.remove('hidden');
             els.quiz.nextBtn.classList.add('hidden');
        }

        // Render based on Type
        if (q.type === 'mcq') {
            renderMCQ(q, savedAnswer);
        } else if (q.type === 'matching') {
            renderMatching(q, savedAnswer);
        } else if (q.type === 'fill_blank' || q.type === 'input') {
            renderInput(q, savedAnswer);
        }
    }

    function renderMCQ(q, savedAnswer) {
        // Reuse options order if already shuffled? No, simpler to just re-render. 
        // Note: shuffling might be confusing if user goes back and options move. 
        // For V1, we accept re-shuffle on re-visit or we can store order. 
        // Let's just re-shuffle for now to keep it simple, unless it's already answered.
        
        let options = [...q.options];
        // Only shuffle if not already stored? Too complex. Just shuffle.
        options.sort(() => Math.random() - 0.5);

        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'option-card';
            div.innerHTML = `<span class="opt-text">${opt}</span>`;
            
            // Restore state if answered
            if(savedAnswer && savedAnswer.attempted) {
                if(opt === savedAnswer.userResponse) {
                    div.classList.add(savedAnswer.correct ? 'correct' : 'incorrect');
                    div.classList.add('selected'); // Highlight what they picked
                }
                if(opt === q.correctAnswer) div.classList.add('correct');
                div.style.pointerEvents = 'none'; // Disable changing answer
            } else {
                div.onclick = () => selectOption(div);
            }
            
            els.quiz.optionsArea.appendChild(div);
        });
    }

    function renderInput(q, savedAnswer) {
        const wrapper = document.createElement('div');
        wrapper.className = 'text-input-wrapper';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type your answer...';
        input.id = 'current-text-input';

        if(savedAnswer && savedAnswer.attempted) {
            input.value = savedAnswer.userResponse;
            input.classList.add(savedAnswer.correct ? 'correct' : 'incorrect');
            input.disabled = true;
            
            if(!savedAnswer.correct) {
                // Show Correct Answer below
                const ansDisplay = document.createElement('div');
                ansDisplay.style.marginTop = '10px';
                ansDisplay.style.color = 'var(--accent-green)';
                ansDisplay.innerHTML = `<strong>Correct Answer:</strong> ${q.correctAnswer[0]}`; // Show primary
                wrapper.appendChild(ansDisplay);
            }
        }

        wrapper.appendChild(input);
        els.quiz.optionsArea.appendChild(wrapper);
    }

    function renderMatching(q, savedAnswer) {
        // Matching is complex to "restore" state without big refactor. 
        // For V1 navigation update: If user goes back to matching, we might reset it or show it as done.
        // Let's show as done if answered, otherwise reset.
        
        const container = document.createElement('div');
        container.className = 'matching-container';
        
        const leftCol = document.createElement('div');
        leftCol.className = 'match-col';
        const rightCol = document.createElement('div');
        rightCol.className = 'match-col';

        let leftItems = q.pairs.map(p => ({ id: p.item, text: p.item }));
        let rightItems = q.pairs.map(p => ({ id: p.item, text: p.match }));

        // Shuffle
        leftItems.sort(() => Math.random() - 0.5);
        rightItems.sort(() => Math.random() - 0.5);

        // If answered, just show them all "matched" or correct? 
        // Simpler: Just disable interaction if answered.
        const isFrozen = savedAnswer && savedAnswer.attempted;

        leftItems.forEach(item => {
            const el = document.createElement('div');
            el.className = 'match-item left';
            el.textContent = item.text;
            el.dataset.id = item.id;
            if (isFrozen) el.classList.add('matched');
            else el.onclick = () => handleMatchClick(el, 'left');
            leftCol.appendChild(el);
        });

        rightItems.forEach(item => {
            const el = document.createElement('div');
            el.className = 'match-item right';
            el.textContent = item.text;
            el.dataset.matchId = item.id;
            if (isFrozen) el.classList.add('matched');
            else el.onclick = () => handleMatchClick(el, 'right');
            rightCol.appendChild(el);
        });

        container.appendChild(leftCol);
        container.appendChild(rightCol);
        els.quiz.optionsArea.appendChild(container);

        if (!isFrozen) {
            state.quiz.currentMatch = { left: null, right: null, matches: 0, total: q.pairs.length };
        }
    }

    // --- INTERACTION LOGIC ---

    function selectOption(el) {
        // Only for MCQ
        if (state.quiz.questions[state.quiz.currentIndex].type === 'matching') return;
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
    }

    function handleMatchClick(el, side) {
        if (el.classList.contains('matched')) return;

        document.querySelectorAll(`.match-item.${side}`).forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        
        state.quiz.currentMatch[side] = el;

        if (state.quiz.currentMatch.left && state.quiz.currentMatch.right) {
            checkMatchAttempt();
        }
    }

    function checkMatchAttempt() {
        const left = state.quiz.currentMatch.left;
        const right = state.quiz.currentMatch.right;

        if (left.dataset.id === right.dataset.matchId) {
            left.classList.remove('selected');
            right.classList.remove('selected');
            left.classList.add('matched');
            right.classList.add('matched');
            state.quiz.currentMatch.matches++;
        } else {
            setTimeout(() => {
                left.classList.remove('selected');
                right.classList.remove('selected');
            }, 300);
        }

        state.quiz.currentMatch.left = null;
        state.quiz.currentMatch.right = null;
    }

    function checkAnswer() {
        const q = state.quiz.questions[state.quiz.currentIndex];
        let isCorrect = false;
        let userResponse = null;

        if (q.type === 'mcq') {
            const selected = document.querySelector('.option-card.selected');
            if (!selected) return; 

            userResponse = selected.querySelector('.opt-text').textContent;
            if (userResponse === q.correctAnswer) {
                isCorrect = true;
                selected.classList.add('correct');
            } else {
                selected.classList.add('incorrect');
                // Highlight correct
                document.querySelectorAll('.option-card').forEach(card => {
                    if (card.querySelector('.opt-text').textContent === q.correctAnswer) {
                        card.classList.add('correct');
                    }
                });
            }
        } 
        else if (q.type === 'input' || q.type === 'fill_blank') {
            const input = document.getElementById('current-text-input');
            userResponse = input.value.trim();
            if(!userResponse) return;

            // Check against array of correct answers (case insensitive)
            const accepted = q.correctAnswer.map(a => a.toLowerCase());
            if (accepted.includes(userResponse.toLowerCase())) {
                isCorrect = true;
                input.classList.add('correct');
            } else {
                input.classList.add('incorrect');
                // Show correct answer logic handled in renderInput on redraw, but we can do it here too for instant feedback
                const wrapper = document.querySelector('.text-input-wrapper');
                const ansDisplay = document.createElement('div');
                ansDisplay.style.marginTop = '10px';
                ansDisplay.style.color = 'var(--accent-green)';
                ansDisplay.innerHTML = `<strong>Correct Answer:</strong> ${q.correctAnswer[0]}`; 
                wrapper.appendChild(ansDisplay);
            }
        }
        else if (q.type === 'matching') {
            // Assume completion = correct for now
            if (state.quiz.currentMatch.matches === state.quiz.currentMatch.total) {
                isCorrect = true;
                userResponse = "completed";
            } else {
                alert("Please match all items.");
                return;
            }
        }

        // Save State
        state.quiz.answers[state.quiz.currentIndex] = {
            attempted: true,
            correct: isCorrect,
            userResponse: userResponse
        };

        if (isCorrect) state.quiz.score++;
        
        showFeedback(isCorrect, q.explanation);

        // Toggle Buttons
        els.quiz.checkBtn.classList.add('hidden');
        els.quiz.nextBtn.classList.remove('hidden');
    }

    function showFeedback(isCorrect, text) {
        els.quiz.feedback.area.className = `feedback-box ${isCorrect ? 'correct' : 'incorrect'}`;
        els.quiz.feedback.title.textContent = isCorrect ? 'Correct!' : 'Incorrect';
        els.quiz.feedback.text.textContent = text;
        els.quiz.feedback.area.classList.remove('hidden');
    }

    function nextQuestion() {
        state.quiz.currentIndex++;
        if (state.quiz.currentIndex >= state.quiz.questions.length) {
            finishQuiz();
        } else {
            renderQuestion();
        }
    }

    function prevQuestion() {
        if (state.quiz.currentIndex > 0) {
            state.quiz.currentIndex--;
            renderQuestion();
        }
    }

    function finishQuiz() {
        if (state.quiz.score === state.quiz.questions.length) {
            state.streak++;
            localStorage.setItem('ppl-streak', state.streak);
            els.streak.textContent = state.streak;
        }

        els.results.score.textContent = `${Math.round((state.quiz.score / state.quiz.questions.length) * 100)}%`;
        els.results.subScore.textContent = `${state.quiz.score} / ${state.quiz.questions.length} Correct`;

        switchView('results');
    }

    function switchView(viewName) {
        Object.values(els.views).forEach(el => el.classList.remove('active-view'));
        Object.values(els.views).forEach(el => el.classList.add('hidden-view'));
        
        els.views[viewName].classList.remove('hidden-view');
        els.views[viewName].classList.add('active-view');
        state.view = viewName;
    }
});

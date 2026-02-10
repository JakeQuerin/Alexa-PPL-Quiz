Original prompt: So right now I have this quiz for Alexa to study for her PPL Canadian pilot license she's at the stage where she is just beginning to fly planes and is wanting to use this as a study tool to help her remember the actual practical knowledge that comes with flying can you go through this project completely revise it and refine the whole thing you can redo some of the questions to be more fitting for what she needs below is some info on the exact specifics on what she wants to cover and what type of plane she's flying in some general context.

Notes:
- Using develop-web-game skill workflow for this HTML/JS project.
- Performing full UI + quiz-engine rewrite for practical C172S-focused Canadian PPL training.
- Will validate with Playwright client and inspect screenshots/state output.

TODO:
- Rebuild question bank with practical categories and varied question types.
- Rebuild quiz logic for mcq/multi-select/short/matching/sequence.
- Add modern responsive visual design and improved interactivity.
- Add render_game_to_text and advanceTime hooks.
- Run automated interaction checks and fix issues.

Update:
- Rewrote UI structure in index.html for briefing/quiz/debrief workflow.
- Replaced style.css with a modern responsive visual system and richer interaction states.
- Rebuilt questions.js with practical Canadian PPL + C172S-focused bank and mixed question formats.
- Replaced script.js with new quiz engine (mcq/multi/short/matching/sequence), weighted scoring, weak-topic retry, and testing hooks.

Testing:
- `node --check script.js` passed.
- `node --check questions.js` passed.
- Attempted Playwright client run blocked: missing `playwright` package and npm install failed due network/DNS (`ENOTFOUND registry.npmjs.org`).
- Added local structural validation for question bank counts/types.

Remaining gap:
- Could not run browser automation screenshots/text-state due offline dependency install failure.

Patch:
- Fixed topic-chip selection state sync bug when switching from "Mix all" to specific topics.

Patch:
- Corrected turn-coordination question answer/explanation (ball-right cue now maps to right rudder).
- Re-ran syntax check and Playwright client loop post-fix.

Major expansion (requested features):
- Added spaced repetition queue and immediate missed-item reinsertion.
- Added cockpit relevance card after answer checks.
- Added stage-based presets and smart session generator with lesson focus bias.
- Added long-term history dashboard and review queue summary.
- Added branching scenario drills.
- Added contextual short-answer scoring with semantic rubric + optional external LLM hook (`window.flightLabShortAnswerScorer`).
- Added oral rapid-fire mode with timer and self-mark flow.

Testing updates:
- Fixed runtime regression (`updateCountCopy` missing).
- Playwright client run passes with state output in `output/web-game-v4`.
- Additional targeted Playwright check confirms oral mode starts and exports state/artifacts in `output/manual-checks`.

// src/engines/mcq-engine.js
// MCQEngine — renders a self-contained, dependency-free multiple-choice quiz
// into a container element. Styles are injected at runtime (no build step
// required), which keeps this file usable standalone, e.g. via
// examples/mcq-demo/, as well as wired into the app shell.
//
// Data shape expected (see schemas/mcq.schema.json):
//   { "lessonId": string, "title": string, "questions": [
//       { "id": number, "question": string, "options": string[],
//         "correct": number, "rationale": string } ] }
//
// Usage: new MCQEngine(containerId, jsonUrlOrObject)

// Embedded default lesson data so it works via file:// double-click
const defaultLessonData = {
  "title": "UX/UI Heuristics — Lesson 1",
  "questions": [
    {
      "id": 1,
      "question": "Which iOS interaction pattern best prevents accidental deletion of user data?",
      "options": [
        "A generic alert asking 'Are you sure?'",
        "A destructive Action Sheet with explicit red confirmation text",
        "Deleting immediately and showing a quick banner notification",
        "Disabling deletion completely on mobile views"
      ],
      "correct": 1,
      "rationale": "Nielsen's 'Error Prevention' heuristic recommends distinct, high-significance visual confirmation controls (like red Action Sheet buttons) for destructive actions to eliminate muscle-memory slips."
    },
    {
      "id": 2,
      "question": "According to Fitts's Law, why are mobile tab bars positioned at the bottom of the screen?",
      "options": [
        "They reduce screen contrast strain",
        "The screen bottom acts as an infinite boundary within easy thumb reach",
        "It leaves more space for large typography titles",
        "It enforces Miller's Law chunking constraints"
      ],
      "correct": 1,
      "rationale": "Fitts's Law states target acquisition time depends on distance and size. Placing interactive controls at the bottom screen edge minimizes thumb travel distance and maximizes target depth."
    }
  ]
};

class MCQEngine {
    constructor(containerId, jsonSource) {
        this.container = document.getElementById(containerId);
        this.jsonSource = jsonSource;
        this.questions = [];
        this.currentIdx = 0;
        this.score = 0;
        this.answered = false;

        this.init();
    }

    async init() {
        this.injectStyles();
        this.renderLayout();
        this.bindElements();

        // Check if data was passed directly as an object or fallback to default data
        if (typeof this.jsonSource === "object") {
            this.questions = this.jsonSource.questions;
            this.renderQuestion();
        } else if (typeof this.jsonSource === "string") {
            try {
                const response = await fetch(this.jsonSource);
                const data = await response.json();
                this.questions = data.questions;
                this.renderQuestion();
            } catch (error) {
                // Fallback to default lesson data if fetch fails (e.g. running via file://)
                console.warn("Fetch failed, loading embedded lesson data instead.");
                this.questions = defaultLessonData.questions;
                this.renderQuestion();
            }
        }
    }

    injectStyles() {
        if (document.getElementById("mcq-engine-styles")) return;

        const style = document.createElement("style");
        style.id = "mcq-engine-styles";
        style.textContent = `
            :root {
                --bg-body: #f5f5f7;
                --bg-card: rgba(255, 255, 255, 0.82);
                --bg-option: #f2f2f7;
                --bg-option-hover: #e5e5ea;
                
                --text-main: #1c1c1e;
                --text-sub: #8e8e93;
                
                --apple-green: #34c759;
                --apple-green-bg: rgba(52, 199, 89, 0.12);
                --apple-red: #ff3b30;
                --apple-red-bg: rgba(255, 59, 48, 0.12);
                --apple-blue: #007aff;
                
                --radius-card: 24px;
                --radius-btn: 14px;
                --ease-apple: cubic-bezier(0.16, 1, 0.3, 1);
            }

            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
                -webkit-font-smoothing: antialiased;
            }

            body {
                background-color: var(--bg-body);
                color: var(--text-main);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1.5rem;
            }

            .mcq-container {
                width: 100%;
                max-width: 520px;
                background: var(--bg-card);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.6);
                border-radius: var(--radius-card);
                padding: 2rem;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
                transition: transform 0.3s var(--ease-apple);
            }

            .step-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }

            .step-count {
                font-size: 0.8rem;
                font-weight: 600;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                color: var(--text-sub);
            }

            .dots-indicator {
                display: flex;
                gap: 6px;
            }

            .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #d1d1d6;
                transition: background 0.3s var(--ease-apple), transform 0.3s var(--ease-apple);
            }

            .dot.active {
                background: var(--apple-blue);
                transform: scale(1.25);
            }

            .dot.completed {
                background: var(--text-sub);
            }

            .question-text {
                font-size: 1.25rem;
                font-weight: 600;
                line-height: 1.4;
                letter-spacing: -0.01em;
                margin-bottom: 1.75rem;
                color: var(--text-main);
            }

            .options-stack {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .option-item {
                background: var(--bg-option);
                border: 1.5px solid transparent;
                border-radius: var(--radius-btn);
                padding: 1rem 1.25rem;
                font-size: 0.95rem;
                font-weight: 500;
                color: var(--text-main);
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.25s var(--ease-apple);
                user-select: none;
            }

            .option-item:hover:not(.disabled) {
                background: var(--bg-option-hover);
                transform: translateY(-1px);
            }

            .option-item.disabled {
                cursor: default;
            }

            .option-item.correct {
                background: var(--apple-green-bg);
                border-color: var(--apple-green);
                color: #155724;
                animation: appleBounce 0.4s var(--ease-apple);
            }

            .option-item.wrong {
                background: var(--apple-red-bg);
                border-color: var(--apple-red);
                color: #721c24;
                animation: appleShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
            }

            .status-badge {
                font-size: 1rem;
                font-weight: 700;
            }

            .rationale-card {
                margin-top: 1.5rem;
                padding: 1rem 1.25rem;
                background: rgba(0, 122, 255, 0.06);
                border-radius: var(--radius-btn);
                font-size: 0.85rem;
                line-height: 1.5;
                color: #1c1c1e;
                display: none;
                animation: fadeIn 0.35s var(--ease-apple);
            }

            .rationale-card.visible {
                display: block;
            }

            .rationale-title {
                font-weight: 700;
                color: var(--apple-blue);
                margin-bottom: 0.25rem;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .card-footer {
                margin-top: 1.75rem;
                display: flex;
                justify-content: flex-end;
            }

            .next-btn {
                background: var(--text-main);
                color: #ffffff;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.25s var(--ease-apple);
                opacity: 0.5;
                pointer-events: none;
            }

            .next-btn.active {
                opacity: 1;
                pointer-events: auto;
            }

            .next-btn.active:hover {
                transform: scale(1.03);
                box-shadow: 0 6px 16px rgba(0,0,0,0.12);
            }

            @keyframes appleShake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-6px); }
                40%, 80% { transform: translateX(6px); }
            }

            @keyframes appleBounce {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .results-view {
                text-align: center;
                padding: 1rem 0;
                display: none;
                animation: fadeIn 0.4s var(--ease-apple);
            }

            .results-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }

            .results-score {
                font-size: 3rem;
                font-weight: 800;
                letter-spacing: -0.03em;
                margin: 1rem 0;
                color: var(--apple-blue);
            }
        `;
        document.head.appendChild(style);
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="mcq-container">
                <div class="step-header">
                    <span class="step-count" id="step-label">Question 1</span>
                    <div class="dots-indicator" id="dots-container"></div>
                </div>

                <div id="question-view">
                    <div class="question-text" id="question-text"></div>
                    <div class="options-stack" id="options-stack"></div>
                    
                    <div class="rationale-card" id="rationale-card">
                        <div class="rationale-title">UX Principle</div>
                        <div id="rationale-text"></div>
                    </div>

                    <div class="card-footer">
                        <button class="next-btn" id="next-btn">Continue</button>
                    </div>
                </div>

                <div class="results-view" id="results-view">
                    <div class="results-title">Assessment Finished</div>
                    <p style="color: var(--text-sub); font-size: 0.9rem;">Your performance summary</p>
                    <div class="results-score" id="score-label">0 / 0</div>
                    <button class="next-btn active" id="restart-btn" style="margin-top: 1rem;">Try Again</button>
                </div>
            </div>
        `;
    }

    bindElements() {
        this.stepLabel = this.container.querySelector("#step-label");
        this.dotsContainer = this.container.querySelector("#dots-container");
        this.questionText = this.container.querySelector("#question-text");
        this.optionsStack = this.container.querySelector("#options-stack");
        this.rationaleCard = this.container.querySelector("#rationale-card");
        this.rationaleText = this.container.querySelector("#rationale-text");
        this.nextBtn = this.container.querySelector("#next-btn");
        this.questionView = this.container.querySelector("#question-view");
        this.resultsView = this.container.querySelector("#results-view");
        this.scoreLabel = this.container.querySelector("#score-label");
        this.restartBtn = this.container.querySelector("#restart-btn");

        this.nextBtn.addEventListener("click", () => this.handleNext());
        this.restartBtn.addEventListener("click", () => this.restart());
    }

    renderDots() {
        this.dotsContainer.innerHTML = "";
        this.questions.forEach((_, idx) => {
            const dot = document.createElement("div");
            dot.className = "dot";
            if (idx === this.currentIdx) dot.classList.add("active");
            if (idx < this.currentIdx) dot.classList.add("completed");
            this.dotsContainer.appendChild(dot);
        });
    }

    renderQuestion() {
        this.answered = false;
        const q = this.questions[this.currentIdx];

        this.stepLabel.textContent = `Question ${this.currentIdx + 1} of ${this.questions.length}`;
        this.questionText.textContent = q.question;
        this.rationaleCard.classList.remove("visible");
        this.nextBtn.classList.remove("active");

        this.renderDots();

        this.optionsStack.innerHTML = "";
        q.options.forEach((optText, index) => {
            const btn = document.createElement("div");
            btn.className = "option-item";
            btn.innerHTML = `
                <span>${optText}</span>
                <span class="status-badge"></span>
            `;

            btn.addEventListener("click", () => this.handleSelect(index, q.correct));
            this.optionsStack.appendChild(btn);
        });
    }

    handleSelect(selectedIndex, correctIndex) {
        if (this.answered) return;
        this.answered = true;

        const options = this.optionsStack.querySelectorAll(".option-item");
        
        options.forEach((opt, idx) => {
            opt.classList.add("disabled");
            
            if (idx === correctIndex) {
                opt.classList.add("correct");
                opt.querySelector(".status-badge").textContent = "✓";
            } else if (idx === selectedIndex && selectedIndex !== correctIndex) {
                opt.classList.add("wrong");
                opt.querySelector(".status-badge").textContent = "✕";
            }
        });

        if (selectedIndex === correctIndex) {
            this.score++;
        }

        this.rationaleText.textContent = this.questions[this.currentIdx].rationale;
        this.rationaleCard.classList.add("visible");
        this.nextBtn.classList.add("active");
    }

    handleNext() {
        if (this.currentIdx < this.questions.length - 1) {
            this.currentIdx++;
            this.renderQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.questionView.style.display = "none";
        this.resultsView.style.display = "block";
        this.stepLabel.textContent = "Completed";
        this.scoreLabel.textContent = `${this.score} / ${this.questions.length}`;
    }

    restart() {
        this.currentIdx = 0;
        this.score = 0;
        this.resultsView.style.display = "none";
        this.questionView.style.display = "block";
        this.renderQuestion();
    }
}
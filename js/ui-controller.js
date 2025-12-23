class UIController {
    constructor() {
        // Cache DOM elements
        this.elements = {
            letterDisplay: document.getElementById('letter-display'),
            feedbackContainer: document.getElementById('feedback-container'),
            feedbackText: document.getElementById('feedback-text'),
            correctAnswer: document.getElementById('correct-answer'),
            statusIndicator: document.getElementById('status-indicator'),
            appContainer: document.querySelector('.app-container'),
            timeoutSlider: document.getElementById('timeout-slider'),
            timeoutValue: document.getElementById('timeout-value'),
            readAloudCheckbox: document.getElementById('read-aloud-checkbox'),
            statsCorrect: document.getElementById('stats-correct'),
            statsIncorrect: document.getElementById('stats-incorrect'),
            statsTimeouts: document.getElementById('stats-timeouts'),
            progressBar: document.getElementById('progress-bar'),
            browserWarning: document.getElementById('browser-warning'),
            instructionText: document.getElementById('instruction-text')
        };
    }

    showLetter(letter) {
        this.elements.letterDisplay.textContent = letter;
        this.elements.letterDisplay.className = 'letter-display';
        this.hideFeedback();
    }

    showCorrectFeedback(answer) {
        this.elements.feedbackContainer.className = 'feedback-container correct';
        this.elements.feedbackText.textContent = 'Correct!';
        this.elements.correctAnswer.textContent = answer;
        this.elements.feedbackContainer.hidden = false;
        this.elements.letterDisplay.classList.add('correct');
    }

    showIncorrectFeedback(userAnswer, correctAnswer) {
        this.elements.feedbackContainer.className = 'feedback-container incorrect';
        this.elements.feedbackText.textContent = `Incorrect. You said "${userAnswer}"`;
        this.elements.correctAnswer.textContent = `Correct answer: ${correctAnswer}`;
        this.elements.feedbackContainer.hidden = false;
        this.elements.letterDisplay.classList.add('incorrect');
    }

    showTimeoutFeedback(correctAnswer) {
        this.elements.feedbackContainer.className = 'feedback-container timeout';
        this.elements.feedbackText.textContent = 'Time\'s up!';
        this.elements.correctAnswer.textContent = `The answer is: ${correctAnswer}`;
        this.elements.feedbackContainer.hidden = false;
        this.elements.letterDisplay.classList.add('timeout');
    }

    hideFeedback() {
        this.elements.feedbackContainer.hidden = true;
    }

    setStatus(status) {
        const statusMap = {
            'ready': { text: 'Press Space to start', class: 'ready' },
            'listening': { text: 'Listening...', class: 'listening' },
            'processing': { text: 'Processing...', class: 'processing' },
            'waiting': { text: 'Waiting for microphone...', class: 'waiting' },
            'error': { text: 'Error occurred', class: 'error' }
        };
        const info = statusMap[status] || statusMap['ready'];
        this.elements.statusIndicator.textContent = info.text;
        this.elements.statusIndicator.className = `status-indicator ${info.class}`;
    }

    updateStats(stats) {
        this.elements.statsCorrect.textContent = stats.correct;
        this.elements.statsIncorrect.textContent = stats.incorrect;
        this.elements.statsTimeouts.textContent = stats.timeouts;
    }

    updateProgressBar(progress) {
        this.elements.progressBar.style.width = `${progress}%`;
    }

    showBrowserWarning(message) {
        this.elements.browserWarning.textContent = message;
        this.elements.browserWarning.hidden = false;
    }

    hideBrowserWarning() {
        this.elements.browserWarning.hidden = true;
    }

    updateTimeoutDisplay(seconds) {
        this.elements.timeoutValue.textContent = `${seconds} seconds`;
        this.elements.timeoutSlider.value = seconds;
    }

    setInstruction(text) {
        this.elements.instructionText.innerHTML = text;
    }

    speakLetter(letter) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.rate = 0.8;  // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Speak it
        window.speechSynthesis.speak(utterance);
    }

    speakFeedback(text) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;  // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Speak it
        window.speechSynthesis.speak(utterance);
    }
}

export { UIController };

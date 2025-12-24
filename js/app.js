import { NATO_ALPHABET, PHONETIC_TO_LETTER, ALTERNATIVE_MATCHES } from './phonetic-data.js';
import { SpeechRecognitionManager } from './speech-recognition.js';
import { StateManager, AppState } from './state-manager.js';
import { SettingsManager } from './settings.js';
import { UIController } from './ui-controller.js';

class App {
    constructor() {
        this.ui = new UIController();
        this.state = new StateManager();
        this.settings = new SettingsManager();
        this.speech = new SpeechRecognitionManager();

        this.timeoutTimer = null;
        this.progressTimer = null;
        this.receivedResult = false;
        this.gracePeriodTimer = null;

        this._init();
    }

    async _init() {
        // Check browser support
        if (!this.speech.isSupported) {
            this.ui.showBrowserWarning(
                'Speech recognition is not supported in your browser. ' +
                'Please use Chrome, Edge, or Safari for the best experience.'
            );
            this.state.setState(AppState.ERROR);
            return;
        }

        // Check microphone permissions
        await this._checkMicrophonePermission();

        // Setup speech callbacks
        this.speech.onResult = (results) => this._handleSpeechResult(results);
        this.speech.onError = (error) => this._handleSpeechError(error);
        this.speech.onEnd = () => this._handleSpeechEnd();
        this.speech.onStart = () => this._handleSpeechStart();

        // Setup state listener
        this.state.subscribe((change) => this._handleStateChange(change));

        // Setup event listeners
        this._setupEventListeners();

        // Initialize UI
        this.ui.updateTimeoutDisplay(this.settings.get('timeoutSeconds'));
        this.ui.updateStats(this.state.stats);

        // Initialize read aloud checkbox
        this.ui.elements.readAloudCheckbox.checked = this.settings.get('readLetterAloud');

        // Ready to start
        this.state.setState(AppState.READY);
        this.ui.setStatus('ready');
        this.ui.setInstruction('Press <kbd>Space</kbd> or tap anywhere to start');

        // Speak initial instruction if audio feedback is enabled
        if (this.settings.get('readLetterAloud')) {
            // Small delay to let page settle
            setTimeout(() => {
                this.ui.speakFeedback('Press space or tap anywhere to start');
            }, 500);
        }
    }

    async _checkMicrophonePermission() {
        try {
            if (!navigator.permissions) {
                return;
            }

            const result = await navigator.permissions.query({ name: 'microphone' });

            if (result.state === 'denied') {
                this.ui.showBrowserWarning(
                    'Microphone access is blocked. Please allow microphone access in your browser settings.'
                );
                this.state.setState(AppState.ERROR);
            } else if (result.state === 'prompt') {
                this.ui.setInstruction('Press <kbd>Space</kbd> or tap to start (microphone access will be requested)');
            }
        } catch (e) {
            // Not all browsers support querying microphone permission
        }
    }

    _setupEventListeners() {

        // Space bar to advance
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                this._handleSpaceBar();
            }
        });

        // Timeout slider
        this.ui.elements.timeoutSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            this.settings.set('timeoutSeconds', value);
            this.ui.updateTimeoutDisplay(value);
        });

        // Read aloud checkbox
        this.ui.elements.readAloudCheckbox.addEventListener('change', (e) => {
            this.settings.set('readLetterAloud', e.target.checked);
        });

        // Click/tap anywhere to advance (except interactive elements)
        document.addEventListener('click', (e) => {
            // Don't trigger if clicking the timeout slider
            if (e.target.closest('.timeout-control') || e.target.closest('input')) {
                return;
            }
            this._handleSpaceBar();
        });
    }

    _handleSpaceBar() {
        const currentState = this.state.currentState;

        if (currentState === AppState.READY ||
            currentState === AppState.SHOWING_RESULT ||
            currentState === AppState.TIMEOUT) {
            this._showNextLetter();
        } else if (currentState === AppState.LISTENING) {
            // Stop listening and show answer
            this.speech.abort();
            this._showTimeout();
        } else if (currentState === AppState.WAITING_FOR_RESULT) {
            // Skip waiting for result and show timeout
            this._clearGracePeriodTimer();
            this.speech.abort();
            this._showTimeout();
        }
    }

    _showNextLetter() {
        // Clear any existing timers
        this._clearTimers();

        // Get random letter
        const letter = this.state.getRandomLetter();
        this.state.setCurrentLetter(letter);

        // Update UI
        this.ui.showLetter(letter);
        this.state.setState(AppState.DISPLAYING_LETTER);

        // Read letter aloud if enabled
        if (this.settings.get('readLetterAloud')) {
            this.ui.speakLetter(letter);
        }

        // Start listening after brief delay
        setTimeout(() => this._startListening(), 300);
    }

    _startListening() {
        this.receivedResult = false;
        this.state.setState(AppState.LISTENING);
        this.ui.setStatus('listening');
        this.ui.setInstruction('Say the NATO phonetic word...');

        // Start speech recognition
        const started = this.speech.start();

        if (!started) {
            console.error('Failed to start speech recognition');
            this.state.setState(AppState.READY);
            this.ui.setStatus('ready');
            this.ui.setInstruction('Failed to start listening. Press <kbd>Space</kbd> to try again.');
            return;
        }

        // Start timeout timer
        const timeoutMs = this.settings.get('timeoutSeconds') * 1000;
        this._startProgressBar(timeoutMs);

        this.timeoutTimer = setTimeout(() => {
            this._handleTimerExpired();
        }, timeoutMs);
    }

    _startProgressBar(totalMs) {
        const interval = 100;
        let elapsed = 0;

        this.ui.updateProgressBar(100);

        this.progressTimer = setInterval(() => {
            elapsed += interval;
            const remaining = Math.max(0, 100 - (elapsed / totalMs) * 100);
            this.ui.updateProgressBar(remaining);

            if (elapsed >= totalMs) {
                clearInterval(this.progressTimer);
            }
        }, interval);
    }

    _clearTimers() {
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
        }
        this._clearGracePeriodTimer();
        this.ui.updateProgressBar(0);
    }

    _clearGracePeriodTimer() {
        if (this.gracePeriodTimer) {
            clearTimeout(this.gracePeriodTimer);
            this.gracePeriodTimer = null;
        }
    }

    _handleTimerExpired() {
        this._clearTimers();  // Stops progress bar, clears timeout timer
        this.state.setState(AppState.WAITING_FOR_RESULT);
        this.ui.setStatus('processing');
        this.ui.setInstruction('Processing...');
        // Don't abort speech - let it finish naturally
        // onresult or onend will handle the final result

        // Safety timeout: if no result/error arrives in 5 seconds, force timeout
        this.gracePeriodTimer = setTimeout(() => {
            if (this.state.currentState === AppState.WAITING_FOR_RESULT) {
                this.speech.abort();
                this._showTimeout();
            }
        }, 5000);
    }

    _handleSpeechResult(results) {
        this._clearGracePeriodTimer();
        this.receivedResult = true;
        this._clearTimers();
        this.state.setState(AppState.PROCESSING);

        const currentLetter = this.state.currentLetter;
        const correctWord = NATO_ALPHABET[currentLetter];

        // Check all alternatives from speech recognition
        let isCorrect = false;
        let heardWord = results[0].transcript;

        for (const result of results) {
            const transcript = result.transcript.toLowerCase().trim();

            // Check direct match
            if (transcript === correctWord.toLowerCase()) {
                isCorrect = true;
                heardWord = result.transcript;
                break;
            }

            // Check if matches the correct letter via phonetic mapping
            if (PHONETIC_TO_LETTER[transcript] === currentLetter) {
                isCorrect = true;
                heardWord = result.transcript;
                break;
            }

            // Check alternative spellings
            if (ALTERNATIVE_MATCHES[transcript] === currentLetter) {
                isCorrect = true;
                heardWord = result.transcript;
                break;
            }
        }

        if (isCorrect) {
            this.state.recordResult('correct');
            this.ui.showCorrectFeedback(correctWord);

            // Speak feedback if enabled
            if (this.settings.get('readLetterAloud')) {
                this.ui.speakFeedback('Correct!');
            }
        } else {
            this.state.recordResult('incorrect');
            this.ui.showIncorrectFeedback(heardWord, correctWord);

            // Speak feedback if enabled
            if (this.settings.get('readLetterAloud')) {
                this.ui.speakFeedback(`Incorrect. The answer was ${correctWord}`);
            }
        }

        this.state.setState(AppState.SHOWING_RESULT);
        this.ui.setStatus('ready');
        this.ui.setInstruction('Press <kbd>Space</kbd> or tap anywhere for next');
        this.ui.updateStats(this.state.stats);
    }

    _handleSpeechError(error) {
        this._clearTimers();
        this._clearGracePeriodTimer();

        if (error.error === 'no-speech') {
            // No speech detected - always show timeout
            // Don't rely on onend, which may not fire reliably after errors
            this._showTimeout();
            return;
        } else if (error.error === 'not-allowed') {
            // Microphone permission denied
            this.ui.showBrowserWarning(error.message);
            this.state.setState(AppState.ERROR);
        } else if (error.error === 'network') {
            // Network errors can be transient, allow retry
            if (this.state.currentLetter) {
                this.ui.setInstruction('Network error. Press <kbd>Space</kbd> to try again.');
                this.state.setState(AppState.SHOWING_RESULT);
            } else {
                // First time error, just reset to ready
                this.state.setState(AppState.READY);
                this.ui.setStatus('ready');
                this.ui.setInstruction('Network error. Press <kbd>Space</kbd> to start.');
            }
        } else {
            console.error('Speech error:', error);
            // For other errors, allow retry
            this.ui.setInstruction(error.message + ' Press <kbd>Space</kbd> to try again.');
            this.state.setState(AppState.SHOWING_RESULT);
        }
    }

    _handleSpeechEnd() {
        this._clearGracePeriodTimer();
        // If waiting for result and recognition ended without one, show timeout
        if (this.state.currentState === AppState.WAITING_FOR_RESULT && !this.receivedResult) {
            this._showTimeout();
        }
    }

    _handleSpeechStart() {
        this.ui.setStatus('listening');
    }

    _showTimeout() {
        this._clearTimers();

        const correctWord = NATO_ALPHABET[this.state.currentLetter];
        this.state.recordResult('timeout');
        this.ui.showTimeoutFeedback(correctWord);

        // Speak feedback if enabled
        if (this.settings.get('readLetterAloud')) {
            this.ui.speakFeedback(`Time's up. The answer was ${correctWord}`);
        }

        this.state.setState(AppState.TIMEOUT);
        this.ui.setStatus('ready');
        this.ui.setInstruction('Press <kbd>Space</kbd> or tap anywhere for next');
        this.ui.updateStats(this.state.stats);
    }

    _handleStateChange(change) {
        // Can be used for debugging or analytics
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

class SpeechRecognitionManager {
    constructor() {
        // Check for browser support with webkit prefix fallback
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            this.isSupported = false;
            this.recognition = null;
            return;
        }

        this.isSupported = true;
        this.recognition = new SpeechRecognition();

        // Configuration
        this.recognition.continuous = false;  // Stop after first result
        this.recognition.interimResults = false;  // Only final results
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;  // Get multiple interpretations

        // Callback placeholders
        this.onResult = null;
        this.onError = null;
        this.onEnd = null;
        this.onStart = null;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.recognition.onresult = (event) => {
            const results = [];
            for (let i = 0; i < event.results[0].length; i++) {
                results.push({
                    transcript: event.results[0][i].transcript.trim().toLowerCase(),
                    confidence: event.results[0][i].confidence
                });
            }
            if (this.onResult) this.onResult(results);
        };

        this.recognition.onerror = (event) => {
            // Handle specific error types
            const errorInfo = {
                error: event.error,
                message: this._getErrorMessage(event.error)
            };
            if (this.onError) this.onError(errorInfo);
        };

        this.recognition.onend = () => {
            if (this.onEnd) this.onEnd();
        };

        this.recognition.onstart = () => {
            if (this.onStart) this.onStart();
        };
    }

    _getErrorMessage(error) {
        const messages = {
            'no-speech': 'No speech was detected. Please try again.',
            'audio-capture': 'No microphone found. Please check your microphone.',
            'not-allowed': 'Microphone permission denied. Please allow microphone access.',
            'network': 'Network error occurred. Speech recognition requires internet.',
            'aborted': 'Speech recognition was aborted.',
            'language-not-supported': 'Language not supported.',
            'service-not-allowed': 'Speech recognition service not allowed.'
        };
        return messages[error] || `Unknown error: ${error}`;
    }

    start() {
        if (!this.isSupported) {
            if (this.onError) {
                this.onError({
                    error: 'not-supported',
                    message: 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
                });
            }
            return false;
        }

        try {
            this.recognition.start();
            return true;
        } catch (e) {
            console.error('Error starting speech recognition:', e);
            // Handle "already started" error
            if (e.name === 'InvalidStateError') {
                this.recognition.stop();
                setTimeout(() => this.recognition.start(), 100);
                return true;  // Fixed: return true since we're retrying
            }
            return false;
        }
    }

    stop() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    abort() {
        if (this.recognition) {
            this.recognition.abort();
        }
    }
}

export { SpeechRecognitionManager };

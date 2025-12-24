import { NATO_ALPHABET } from './phonetic-data.js';

// Application states
const AppState = {
    INITIALIZING: 'initializing',
    WAITING_FOR_MIC: 'waiting_for_mic',
    READY: 'ready',
    DISPLAYING_LETTER: 'displaying_letter',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    WAITING_FOR_RESULT: 'waiting_for_result',
    SHOWING_RESULT: 'showing_result',
    TIMEOUT: 'timeout',
    ERROR: 'error'
};

class StateManager {
    constructor() {
        this.currentState = AppState.INITIALIZING;
        this.currentLetter = null;
        this.usedLetters = [];
        this.deck = [];
        this.recentLetters = [];  // Rolling window of last 5 returned letters
        this.MAX_RESHUFFLE_ATTEMPTS = 100;  // Safety limit to prevent infinite loops
        this.stats = {
            correct: 0,
            incorrect: 0,
            timeouts: 0,
            total: 0
        };
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    _notify(change) {
        this.listeners.forEach(callback => callback(change, this));
    }

    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;
        this._notify({ type: 'state', oldState, newState });
    }

    setCurrentLetter(letter) {
        this.currentLetter = letter;
        this.usedLetters.push(letter);
        this._notify({ type: 'letter', letter });
    }

    _shuffleDeck() {
        let attempts = 0;

        while (attempts < this.MAX_RESHUFFLE_ATTEMPTS) {
            const letters = Object.keys(NATO_ALPHABET);
            // Fisher-Yates shuffle
            for (let i = letters.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [letters[i], letters[j]] = [letters[j], letters[i]];
            }

            // Check for overlap with recent letters
            if (!this._hasOverlap(letters)) {
                this.deck = letters;
                return;
            }

            attempts++;
        }

        // Safety fallback: use deck anyway after max attempts (extremely unlikely)
        this.deck = Object.keys(NATO_ALPHABET);
    }

    _hasOverlap(newDeck) {
        // No previous letters to check on first shuffle
        if (this.recentLetters.length === 0) {
            return false;
        }

        // Get the last 5 positions of new deck (these will be popped first)
        const upcomingLetters = newDeck.slice(-5);

        // Check if any upcoming letters match recent letters
        for (const letter of upcomingLetters) {
            if (this.recentLetters.includes(letter)) {
                return true;
            }
        }

        return false;
    }

    getNextLetter() {
        // Reshuffle when deck is empty
        if (this.deck.length === 0) {
            this._shuffleDeck();
        }
        const letter = this.deck.pop();

        // Track last 5 returned letters
        this.recentLetters.push(letter);
        if (this.recentLetters.length > 5) {
            this.recentLetters.shift(); // Keep only last 5
        }

        return letter;
    }

    recordResult(type) {
        this.stats.total++;
        if (type === 'correct') this.stats.correct++;
        else if (type === 'incorrect') this.stats.incorrect++;
        else if (type === 'timeout') this.stats.timeouts++;
        this._notify({ type: 'stats', stats: this.stats });
    }

    reset() {
        this.currentLetter = null;
        this.usedLetters = [];
        this.deck = [];
        this.recentLetters = [];  // Clear tracked letters on reset
        this.stats = { correct: 0, incorrect: 0, timeouts: 0, total: 0 };
        this.setState(AppState.READY);
    }
}

export { StateManager, AppState };

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

    getRandomLetter() {
        const letters = Object.keys(NATO_ALPHABET);
        return letters[Math.floor(Math.random() * letters.length)];
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
        this.stats = { correct: 0, incorrect: 0, timeouts: 0, total: 0 };
        this.setState(AppState.READY);
    }
}

export { StateManager, AppState };

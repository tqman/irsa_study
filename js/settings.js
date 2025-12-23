const DEFAULT_SETTINGS = {
    timeoutSeconds: 5,      // Default timeout in seconds
    readLetterAloud: true   // Default to ON for accessibility
};

class SettingsManager {
    constructor() {
        this.settings = this._loadSettings();
    }

    _loadSettings() {
        try {
            const saved = localStorage.getItem('irsa_settings');
            if (saved) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
        return { ...DEFAULT_SETTINGS };
    }

    save() {
        try {
            localStorage.setItem('irsa_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.save();
    }

    getAll() {
        return { ...this.settings };
    }
}

export { SettingsManager, DEFAULT_SETTINGS };

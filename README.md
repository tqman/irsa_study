# NATO Phonetic Alphabet Practice

A browser-based flashcard app for practicing the International Radiotelephony Spelling Alphabet (NATO phonetic alphabet). Uses the Web Speech API for voice recognition and text-to-speech.

## 🌐 Try It Now

**Live Demo**: https://tqman.github.io/irsa_study/

## Features

- **Random Letter Display**: Randomly selects letters from A-Z for practice
- **Voice Recognition**: Uses the browser's built-in Web Speech API to listen for your answers
- **Audio Feedback** (Accessibility): Text-to-speech announces letters and results - enabled by default for blind users
- **Configurable Timeout**: Adjust the answer timeout from 1-30 seconds (default: 5 seconds)
- **Real-time Feedback**:
  - Green for correct answers with "Correct!" announcement
  - Red for incorrect answers with the correct answer shown and spoken
  - Orange for timeouts with the answer revealed
- **Progress Tracking**: Tracks correct answers, incorrect answers, and timeouts
- **Persistent Settings**: Saves your preferences (timeout, audio feedback) in localStorage
- **Flexible Controls**:
  - Press <kbd>Space</kbd> to advance
  - Or tap/click anywhere on the page
  - Keyboard accessible with proper focus indicators

## Browser Support

The app requires a browser with Web Speech API support:

- ✅ Chrome 25+ (full support)
- ✅ Edge Chromium (full support)
- ✅ Safari 14.1+ (partial support)
- ❌ Firefox (not supported)

**Note**: Microphone access is required. The browser will prompt for permission on first use.

## How to Use

1. **Open the app**: Visit the GitHub Pages URL or open `index.html` in a supported browser
2. **Grant microphone access**: Your browser will prompt for permission on first use
3. **Hear the instruction**: The app will announce "Press space or tap anywhere to start"
4. **Start practicing**: Press <kbd>Space</kbd> or tap/click anywhere on the page
5. **Listen to the letter**: The app shows and speaks a random letter (e.g., "K")
6. **Say the phonetic word**: Speak the NATO phonetic word (e.g., "Kilo")
7. **Get feedback**: Hear and see if you're correct, incorrect, or timed out
8. **Continue**: Press <kbd>Space</kbd> or tap anywhere for the next letter

### Settings

- **Answer Timeout**: Slider to adjust response time (1-30 seconds, default: 5)
- **Audio feedback**: Toggle checkbox to enable/disable text-to-speech (enabled by default)

### Accepted Alternatives

The app accepts common alternative spellings:
- "Alpha" for "Alfa"
- "Juliet" for "Juliett"
- "X ray" or "Xray" for "X-ray"
- "Whisky" for "Whiskey"

## NATO Phonetic Alphabet Reference

| Letter | Word     | Letter | Word     |
|--------|----------|--------|----------|
| A      | Alfa     | N      | November |
| B      | Bravo    | O      | Oscar    |
| C      | Charlie  | P      | Papa     |
| D      | Delta    | Q      | Quebec   |
| E      | Echo     | R      | Romeo    |
| F      | Foxtrot  | S      | Sierra   |
| G      | Golf     | T      | Tango    |
| H      | Hotel    | U      | Uniform  |
| I      | India    | V      | Victor   |
| J      | Juliett  | W      | Whiskey  |
| K      | Kilo     | X      | X-ray    |
| L      | Lima     | Y      | Yankee   |
| M      | Mike     | Z      | Zulu     |

## Accessibility

This app is designed to be fully accessible:

- **Audio Feedback**: Text-to-speech enabled by default announces all letters and results
- **Blind Users**: Can use the app without any visual feedback - everything is spoken aloud
- **Keyboard Navigation**: Full keyboard support with <kbd>Space</kbd> and <kbd>Tab</kbd>
- **Touch Support**: Tap anywhere on mobile devices
- **No Screen Reader Required**: Built-in TTS provides comprehensive audio feedback

## Deployment to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Under "Source", select: **Deploy from a branch**
4. Under "Branch", select: **main** and **/ (root)**
5. Click **Save**
6. Your app will be available at https://tqman.github.io/irsa_study/
7. Wait a few minutes for deployment to complete

## File Structure

```
irsa_study/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styling (dark theme)
└── js/
    ├── app.js              # Main application orchestration
    ├── phonetic-data.js    # NATO alphabet mapping
    ├── speech-recognition.js   # Web Speech API wrapper
    ├── ui-controller.js    # DOM manipulation
    ├── state-manager.js    # Application state
    └── settings.js         # Settings persistence
```

## Technical Details

- **No build step required**: Pure HTML/CSS/JavaScript
- **No external dependencies**: Uses only browser APIs
  - Web Speech API (`SpeechRecognition`) for voice input
  - Web Speech API (`SpeechSynthesis`) for text-to-speech output
- **Zero operating cost**: Static site hosting on GitHub Pages
- **ES6 Modules**: Modern JavaScript with import/export
- **LocalStorage**: Persists settings across sessions
- **Progressive Enhancement**: Graceful degradation for unsupported browsers

## Privacy

This app runs entirely in your browser. No data is sent to any external server by the app itself. However:

- **Speech Recognition**: Your voice input may be sent to your browser vendor's speech recognition service (Google for Chrome, Apple for Safari, Microsoft for Edge)
- **Text-to-Speech**: Uses your browser's built-in TTS engine (runs locally on most modern browsers)
- **Settings Storage**: Preferences are saved only in your browser's localStorage (never sent anywhere)

## License

This is free and unencumbered software released into the public domain. See [LICENSE](LICENSE) for details.

// Complete NATO phonetic alphabet mapping
const NATO_ALPHABET = {
    'A': 'Alfa',
    'B': 'Bravo',
    'C': 'Charlie',
    'D': 'Delta',
    'E': 'Echo',
    'F': 'Foxtrot',
    'G': 'Golf',
    'H': 'Hotel',
    'I': 'India',
    'J': 'Juliett',
    'K': 'Kilo',
    'L': 'Lima',
    'M': 'Mike',
    'N': 'November',
    'O': 'Oscar',
    'P': 'Papa',
    'Q': 'Quebec',
    'R': 'Romeo',
    'S': 'Sierra',
    'T': 'Tango',
    'U': 'Uniform',
    'V': 'Victor',
    'W': 'Whiskey',
    'X': 'X-ray',
    'Y': 'Yankee',
    'Z': 'Zulu'
};

// Create reverse mapping for validation (word -> letter)
const PHONETIC_TO_LETTER = Object.fromEntries(
    Object.entries(NATO_ALPHABET).map(([letter, word]) => [word.toLowerCase(), letter])
);

// Alternative spellings/pronunciations that should be accepted
const ALTERNATIVE_MATCHES = {
    'alpha': 'A',      // Common alternate spelling
    'juliet': 'J',     // Common alternate spelling
    'x ray': 'X',
    'xray': 'X',
    'whisky': 'W'      // British spelling
};

// Get all letters as an array for random selection
const LETTERS = Object.keys(NATO_ALPHABET);

export { NATO_ALPHABET, PHONETIC_TO_LETTER, ALTERNATIVE_MATCHES, LETTERS };

// utils/movie-tags.js
// A mapping of common movie themes/concepts to related keywords
const MOVIE_TAGS = {
    // Sci-fi concepts
    'aliens': ['alien', 'extraterrestrial', 'ufo', 'space invasion', 'et'],
    'space': ['outer space', 'spacecraft', 'astronaut', 'spaceship', 'galaxy'],
    'time travel': ['time machine', 'future', 'past', 'timeline', 'temporal'],
    'dystopia': ['post-apocalyptic', 'future society', 'dystopian', 'totalitarian'],
    'robots': ['android', 'ai', 'artificial intelligence', 'cyborg', 'machine', 'robotic'],
    
    // Adventure/Fantasy concepts
    'magic': ['wizard', 'witch', 'sorcery', 'magical', 'spell'],
    'superheroes': ['superhero', 'powers', 'marvel', 'dc', 'comic book'],
    'dragons': ['dragon', 'mythical creature', 'fantasy creature'],
    'medieval': ['knights', 'castle', 'kingdom', 'sword', 'middle ages'],
    
    // Thriller/Horror concepts
    'zombies': ['undead', 'walking dead', 'apocalypse', 'outbreak'],
    'ghosts': ['haunting', 'paranormal', 'spirit', 'haunted house', 'supernatural'],
    'serial killer': ['murderer', 'psychopath', 'killer', 'slasher'],
    'vampires': ['vampire', 'dracula', 'blood sucker', 'undead'],
    
    // Plot-based themes
    'heist': ['robbery', 'stealing', 'theft', 'bank robbery'],
    'revenge': ['vengeance', 'retribution', 'payback', 'vendetta'],
    'survival': ['wilderness', 'stranded', 'disaster', 'lone survivor'],
    'coming of age': ['growing up', 'teenage', 'youth', 'adolescence'],
    'true story': ['based on true events', 'real life', 'biography', 'historical'],
    
    // Character-based themes
    'spies': ['espionage', 'secret agent', 'spy', 'intelligence agency', 'covert'],
    'pirates': ['pirate', 'swashbuckler', 'treasure', 'caribbean'],
    'detectives': ['detective', 'investigation', 'mystery solving', 'sleuth'],
    'animals': ['animal protagonist', 'wildlife', 'pets', 'dog', 'cat']
};

// Map for fuzzy matching - flattens the above structure for easier searching
const buildTagKeywordMap = () => {
    const map = new Map();
    
    for (const [tag, keywords] of Object.entries(MOVIE_TAGS)) {
        // Add the main tag itself
        map.set(tag, tag);
        
        // Add all related keywords for this tag
        for (const keyword of keywords) {
            map.set(keyword, tag);
        }
    }
    
    return map;
};

const TAG_KEYWORD_MAP = buildTagKeywordMap();

module.exports = {
    MOVIE_TAGS,
    TAG_KEYWORD_MAP
};
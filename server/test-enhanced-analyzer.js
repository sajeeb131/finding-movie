// Test script for the enhanced simple analyzer
require('dotenv').config();

const { analyzePromptSimple } = require('./services/simple-analyzer');

async function testEnhancedAnalyzer() {
    console.log('='.repeat(60));
    console.log('TESTING ENHANCED PATTERN RECOGNITION');
    console.log('='.repeat(60));
    
    const testCases = [
        // Actor-based tests
        {
            prompt: 'find 5 brad pitt movies',
            expected: { movieName: null, actors: ['brad pitt'], count: 5 }
        },
        {
            prompt: 'find tom cruise movies',
            expected: { movieName: null, actors: ['tom cruise'] }
        },
        {
            prompt: 'movies with leonardo dicaprio',
            expected: { movieName: null, actors: ['leonardo dicaprio'] }
        },
        
        // Genre-based tests
        {
            prompt: 'find 3 comedy movies',
            expected: { movieName: null, genre: ['comedy'], count: 3 }
        },
        {
            prompt: 'find action movies',
            expected: { movieName: null, genre: ['action'] }
        },
        {
            prompt: 'find funny movies',
            expected: { movieName: null, genre: ['comedy'] }
        },
        
        // Movie name tests
        {
            prompt: 'find titanic',
            expected: { movieName: 'titanic' }
        },
        {
            prompt: 'find the matrix',
            expected: { movieName: 'the matrix' }
        },
        {
            prompt: 'find avatar',
            expected: { movieName: 'avatar' }
        },
        
        // Complex tests
        {
            prompt: 'find 5 action movies with will smith',
            expected: { movieName: null, actors: ['will smith'], genre: ['action'], count: 5 }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n🔍 Testing: "${testCase.prompt}"`);
        console.log('-'.repeat(40));
        
        const result = analyzePromptSimple(testCase.prompt);
        
        // Check if expectations match
        let passed = true;
        
        if (testCase.expected.movieName !== undefined) {
            if (result.movieName !== testCase.expected.movieName) {
                console.log(`❌ movieName: expected "${testCase.expected.movieName}", got "${result.movieName}"`);
                passed = false;
            } else {
                console.log(`✅ movieName: "${result.movieName}"`);
            }
        }
        
        if (testCase.expected.actors !== undefined) {
            const actorsMatch = testCase.expected.actors.every(actor => 
                result.actors.includes(actor)
            );
            if (!actorsMatch) {
                console.log(`❌ actors: expected [${testCase.expected.actors.join(', ')}], got [${result.actors.join(', ')}]`);
                passed = false;
            } else {
                console.log(`✅ actors: [${result.actors.join(', ')}]`);
            }
        }
        
        if (testCase.expected.genre !== undefined) {
            const genreMatch = testCase.expected.genre.every(genre => 
                result.genre.includes(genre)
            );
            if (!genreMatch) {
                console.log(`❌ genre: expected [${testCase.expected.genre.join(', ')}], got [${result.genre.join(', ')}]`);
                passed = false;
            } else {
                console.log(`✅ genre: [${result.genre.join(', ')}]`);
            }
        }
        
        if (testCase.expected.count !== undefined) {
            if (result.count !== testCase.expected.count) {
                console.log(`❌ count: expected ${testCase.expected.count}, got ${result.count}`);
                passed = false;
            } else {
                console.log(`✅ count: ${result.count}`);
            }
        }
        
        if (passed) {
            console.log('✅ PASSED');
        } else {
            console.log('❌ FAILED');
            console.log('Full result:', JSON.stringify(result, null, 2));
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
}

// Run the test
testEnhancedAnalyzer();
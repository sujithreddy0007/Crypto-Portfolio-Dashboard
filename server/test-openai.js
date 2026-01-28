// Test OpenAI API
require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;

    console.log('=== OpenAI API Test ===');
    console.log('API Key present:', apiKey ? 'Yes (starts with ' + apiKey.substring(0, 15) + '...)' : 'NO - MISSING!');

    if (!apiKey) {
        console.error('ERROR: OPENAI_API_KEY not found in .env file');
        return;
    }

    try {
        const client = new OpenAI({ apiKey });

        console.log('Sending test message...');
        const completion = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: 'Say "Hello! OpenAI is working!" in response.' }
            ],
            max_tokens: 50
        });

        console.log('\n=== SUCCESS! ===');
        console.log('Response:', completion.choices[0]?.message?.content);
    } catch (error) {
        console.error('\n=== ERROR ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Status:', error.status);
        if (error.error) {
            console.error('Error details:', error.error);
        }
    }
}

testOpenAI();

// Script rápido para verificar se a quota do Gemini foi resetada
// Execute com: node check-gemini-quota.js

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDAzzC6bSESZLGYH57WETYr1Fg1IPOTSx8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

console.log('🔍 Checking Gemini API quota status...\n');

async function checkQuota() {
  try {
    console.log('⏳ Sending test request...');
    const startTime = Date.now();

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Say "OK"',
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 5,
        },
      }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  Response time: ${duration}ms\n`);

    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ SUCCESS! Your quota is available!');
      console.log('✅ You can now use the app to analyze receipts.');
      console.log(`   Response: ${data.candidates[0].content.parts[0].text}`);
      return true;
    } else if (response.status === 429) {
      const data = await response.json();
      console.log('❌ QUOTA EXCEEDED (429)');
      console.log('⏱️  You still need to wait before making more requests.\n');
      console.log('Solutions:');
      console.log('  1. Wait 60 seconds and try again (for per-minute limit)');
      console.log('  2. Wait until tomorrow (for daily limit of 1500 req/day)');
      console.log('  3. Get a new API key at: https://aistudio.google.com/app/apikey\n');
      console.log('Retry this check in 60 seconds: node check-gemini-quota.js');
      return false;
    } else {
      const data = await response.json();
      console.log(`❌ ERROR ${response.status}: ${response.statusText}`);
      console.log('Error details:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
    console.log('Check your internet connection and try again.');
    return false;
  }
}

checkQuota();

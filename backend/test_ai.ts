import 'dotenv/config';
import { unifiedAI } from './src/services/aiProvider.js';

async function test() {
  console.log('Testing unified AI...');
  try {
    const res = await unifiedAI.generateChat([{ role: 'user', content: 'What is 2+2? Answer in one word or number.' }]);
    console.log('SUCCESS! Provider:', res.provider, 'Result:', res.text);
  } catch (err: any) {
    console.error('AI Error:', err);
  }
}

test();

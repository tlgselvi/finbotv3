// Test Login API Directly
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testLogin() {
  console.log('🧪 Testing Login API Directly...\n');

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@finbot.com',
        password: 'admin123',
      }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();

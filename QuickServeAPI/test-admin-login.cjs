const http = require('http');

const data = JSON.stringify({
  email: 'admin@finbot.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Testing Admin Login API...\n');
console.log('URL: http://localhost:5000/api/auth/login');
console.log('Credentials: admin@finbot.com / admin123\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response (raw):', body);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();

const http = require('http');

// Test admin login first to get token
const loginData = JSON.stringify({
  email: 'admin@finbot.com',
  password: 'admin123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🧪 Testing Dashboard APIs...\n');

// First login to get token
const loginReq = http.request(loginOptions, (loginRes) => {
  let loginBody = '';
  loginRes.on('data', (chunk) => {
    loginBody += chunk;
  });
  
  loginRes.on('end', () => {
    try {
      const loginResult = JSON.parse(loginBody);
      if (loginResult.token) {
        console.log('✅ Login successful, token received');
        
        // Test consolidation breakdown
        testEndpoint('/api/consolidation/breakdown', loginResult.token, 'Consolidation Breakdown');
        
        // Test risk analysis
        testEndpoint('/api/risk/analysis?fxDelta=0&rateDelta=0&inflationDelta=0&liquidityGap=0', loginResult.token, 'Risk Analysis');
        
      } else {
        console.error('❌ Login failed:', loginResult);
      }
    } catch (e) {
      console.error('❌ Login response parse error:', e.message);
      console.error('Response:', loginBody);
    }
  });
});

function testEndpoint(path, token, name) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: path,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  console.log(`\n📊 Testing ${name}...`);
  console.log(`URL: http://localhost:5000${path}`);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      try {
        if (res.statusCode === 200) {
          const json = JSON.parse(body);
          console.log('✅ Success:', JSON.stringify(json, null, 2).substring(0, 200) + '...');
        } else {
          console.log('❌ Error Response:', body.substring(0, 200) + '...');
        }
      } catch (e) {
        console.log('❌ Response parse error:', body.substring(0, 200) + '...');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.end();
}

loginReq.on('error', (error) => {
  console.error('❌ Login request error:', error.message);
});

loginReq.write(loginData);
loginReq.end();

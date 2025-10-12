// Hızlı API Test Scripti
const http = require('http');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

async function testAPI(endpoint, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log(`\n${colors.cyan}🤖 OTOMATIK API TESTİ BAŞLATILIYOR...${colors.reset}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  console.log(`${colors.yellow}1️⃣ Health Check...${colors.reset}`);
  try {
    const result = await testAPI('/api/health');
    if (result.status === 200) {
      console.log(`   ${colors.green}✅ Backend çalışıyor!${colors.reset}`);
      console.log(`   Response: ${JSON.stringify(result.data)}`);
      passed++;
    } else {
      console.log(`   ${colors.red}❌ Health check başarısız (${result.status})${colors.reset}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ${colors.red}❌ Backend'e ulaşılamıyor: ${error.message}${colors.reset}`);
    failed++;
  }

  // Test 2: Login
  console.log(`\n${colors.yellow}2️⃣ Login Test...${colors.reset}`);
  let token = null;
  try {
    const result = await testAPI('/api/auth/login', 'POST', {
      email: 'admin@finbot.com',
      password: 'admin123'
    });
    
    if (result.status === 200 && result.data.token) {
      token = result.data.token;
      console.log(`   ${colors.green}✅ Login başarılı!${colors.reset}`);
      console.log(`   User: ${result.data.user.email} (${result.data.user.role})`);
      passed++;
    } else {
      console.log(`   ${colors.red}❌ Login başarısız (${result.status})${colors.reset}`);
      console.log(`   ${JSON.stringify(result.data)}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ${colors.red}❌ Login hatası: ${error.message}${colors.reset}`);
    failed++;
  }

  if (!token) {
    console.log(`\n${colors.red}⚠️ Token alınamadı, diğer testler atlanıyor...${colors.reset}`);
  } else {
    // Test 3: Dashboard
    console.log(`\n${colors.yellow}3️⃣ Dashboard API Test...${colors.reset}`);
    try {
      const result = await testAPI('/api/dashboard', 'GET', null, token);
      if (result.status === 200) {
        console.log(`   ${colors.green}✅ Dashboard API çalışıyor!${colors.reset}`);
        console.log(`   Accounts: ${result.data.accounts?.length || 0}`);
        console.log(`   Transactions: ${result.data.totalTransactions || 0}`);
        passed++;
      } else {
        console.log(`   ${colors.red}❌ Dashboard API başarısız (${result.status})${colors.reset}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ${colors.red}❌ Dashboard hatası: ${error.message}${colors.reset}`);
      failed++;
    }

    // Test 4: Consolidation Breakdown
    console.log(`\n${colors.yellow}4️⃣ Consolidation Breakdown Test...${colors.reset}`);
    try {
      const result = await testAPI('/api/consolidation/breakdown', 'GET', null, token);
      if (result.status === 200) {
        console.log(`   ${colors.green}✅ Consolidation API çalışıyor!${colors.reset}`);
        console.log(`   Total: ${result.data.summary?.totalAmount || 0}`);
        passed++;
      } else {
        console.log(`   ${colors.red}❌ Consolidation başarısız (${result.status})${colors.reset}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ${colors.red}❌ Consolidation hatası: ${error.message}${colors.reset}`);
      failed++;
    }

    // Test 5: Risk Analysis
    console.log(`\n${colors.yellow}5️⃣ Risk Analysis Test...${colors.reset}`);
    try {
      const result = await testAPI('/api/risk/analysis?fxDelta=5&rateDelta=-2', 'GET', null, token);
      if (result.status === 200) {
        console.log(`   ${colors.green}✅ Risk Analysis API çalışıyor!${colors.reset}`);
        console.log(`   Risk Level: ${result.data.riskLevel || 'N/A'}`);
        passed++;
      } else {
        console.log(`   ${colors.red}❌ Risk Analysis başarısız (${result.status})${colors.reset}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ${colors.red}❌ Risk Analysis hatası: ${error.message}${colors.reset}`);
      failed++;
    }
  }

  // Sonuçlar
  console.log(`\n${'━'.repeat(63)}`);
  console.log(`${colors.cyan}📊 TEST SONUÇLARI:${colors.reset}`);
  console.log(`   ✅ Başarılı: ${colors.green}${passed}${colors.reset}`);
  console.log(`   ❌ Başarısız: ${colors.red}${failed}${colors.reset}`);
  console.log(`   📊 Başarı Oranı: ${colors.cyan}${((passed / (passed + failed)) * 100).toFixed(0)}%${colors.reset}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 TÜM TESTLER BAŞARILI!${colors.reset}`);
    console.log(`\n${colors.cyan}🌐 Browser'da manuel test yapabilirsin:${colors.reset}`);
    console.log(`   📍 http://localhost:5173`);
    console.log(`   👤 admin@finbot.com / admin123`);
  } else {
    console.log(`\n${colors.yellow}⚠️ Bazı testler başarısız oldu. Minimize pencereleri kontrol et.${colors.reset}`);
  }
  
  console.log('\n');
}

runTests().catch(console.error);


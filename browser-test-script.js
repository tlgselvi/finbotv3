// FinBot v3 - Browser Console Test Script
// F12 ile Console'u açın ve bu kodları yapıştırın

// 1. Health Check Test
async function testHealth() {
  console.log('🧪 Testing Health Endpoint...');
  const response = await fetch('http://localhost:5000/api/health');
  const data = await response.json();
  console.log('✅ Health:', data);
  return data.status === 'ok';
}

// 2. Login Test
async function testLogin() {
  console.log('🧪 Testing Login...');
  const response = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@finbot.com',
      password: 'admin123'
    })
  });
  const data = await response.json();
  console.log('✅ Login:', data);
  
  // Token'ı sakla
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
    console.log('✅ Token saved to localStorage');
  }
  return data;
}

// 3. Accounts Test
async function testAccounts() {
  console.log('🧪 Testing Accounts...');
  const token = localStorage.getItem('auth_token');
  const response = await fetch('http://localhost:5000/api/accounts', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log('✅ Accounts:', data);
  return data;
}

// 4. Dashboard Runway Test
async function testRunway(userId = 'test-user-123') {
  console.log('🧪 Testing Runway Analysis...');
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`http://localhost:5000/api/dashboard/runway/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log('✅ Runway Analysis:', data);
  console.log(`💰 Current Cash: ${data.currentCash}`);
  console.log(`📊 Monthly Expenses: ${data.monthlyExpenses}`);
  console.log(`📅 Runway Months: ${data.runwayMonths}`);
  console.log(`⚠️ Status: ${data.status}`);
  return data;
}

// 5. Tüm Testleri Çalıştır
async function runAllTests() {
  console.log('🚀 Starting All Tests...\n');
  
  try {
    await testHealth();
    await testLogin();
    await testAccounts();
    // await testRunway(); // User ID gerekli
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Kullanım:
console.log('🎯 FinBot v3 Test Functions Available:');
console.log('- testHealth()');
console.log('- testLogin()');
console.log('- testAccounts()');
console.log('- testRunway(userId)');
console.log('- runAllTests()');
console.log('\nÖrnek: runAllTests()');


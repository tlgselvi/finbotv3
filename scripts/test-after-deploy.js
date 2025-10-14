#!/usr/bin/env node

/**
 * Post-Deploy Test Script
 * Bu script Render.com deploy sonrası tüm sistemleri test eder
 */

// Using built-in fetch (Node.js 18+)

const BASE_URL = 'https://finbot-v3.onrender.com';

console.log('🚀 Post-Deploy Test Başlatılıyor...\n');

// Test functions
async function testHealthEndpoint() {
    console.log('1️⃣ Health endpoint test ediliyor...');
    try {
        const response = await fetch(`${BASE_URL}/api/health`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Health endpoint çalışıyor:', data);
            return true;
        } else {
            console.log('❌ Health endpoint hatası:', response.status, await response.text());
            return false;
        }
    } catch (error) {
        console.log('❌ Health endpoint bağlantı hatası:', error.message);
        return false;
    }
}

async function testLoginEndpoint() {
    console.log('\n2️⃣ Login endpoint test ediliyor...');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                email: 'admin@finbot.com',
                password: 'admin123'
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login endpoint çalışıyor');
            return data.token;
        } else {
            console.log('❌ Login endpoint hatası:', response.status, await response.text());
            return null;
        }
    } catch (error) {
        console.log('❌ Login endpoint bağlantı hatası:', error.message);
        return null;
    }
}

async function testIPUnblockEndpoint(token) {
    console.log('\n3️⃣ IP unblock endpoint test ediliyor...');
    try {
        const response = await fetch(`${BASE_URL}/api/security/blocked-ips`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ IP unblock endpoint çalışıyor');
            console.log('📊 Blocked IPs:', data.blockedIPs);
            return true;
        } else {
            console.log('❌ IP unblock endpoint hatası:', response.status, await response.text());
            return false;
        }
    } catch (error) {
        console.log('❌ IP unblock endpoint bağlantı hatası:', error.message);
        return false;
    }
}

async function testStaticFiles() {
    console.log('\n4️⃣ Static files test ediliyor...');
    try {
        const response = await fetch(`${BASE_URL}/manifest.json`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            console.log('✅ Manifest.json çalışıyor');
            return true;
        } else {
            console.log('❌ Manifest.json hatası:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Static files bağlantı hatası:', error.message);
        return false;
    }
}

async function testFavicon() {
    console.log('\n5️⃣ Favicon test ediliyor...');
    try {
        const response = await fetch(`${BASE_URL}/favicon.ico`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            console.log('✅ Favicon.ico çalışıyor');
            return true;
        } else {
            console.log('❌ Favicon.ico hatası:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Favicon bağlantı hatası:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🎯 FinBot v3 Post-Deploy Test Suite\n');

    const results = {
        health: false,
        login: false,
        ipUnblock: false,
        staticFiles: false,
        favicon: false
    };

    // Run tests
    results.health = await testHealthEndpoint();

    if (results.health) {
        const token = await testLoginEndpoint();
        results.login = !!token;

        if (token) {
            results.ipUnblock = await testIPUnblockEndpoint(token);
        }
    }

    results.staticFiles = await testStaticFiles();
    results.favicon = await testFavicon();

    // Summary
    console.log('\n📊 Test Sonuçları:');
    console.log('==================');
    console.log(`Health Endpoint: ${results.health ? '✅' : '❌'}`);
    console.log(`Login Endpoint: ${results.login ? '✅' : '❌'}`);
    console.log(`IP Unblock Endpoint: ${results.ipUnblock ? '✅' : '❌'}`);
    console.log(`Static Files: ${results.staticFiles ? '✅' : '❌'}`);
    console.log(`Favicon: ${results.favicon ? '✅' : '❌'}`);

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    console.log(`\n🎯 Başarı Oranı: ${successCount}/${totalCount} (${Math.round(successCount / totalCount * 100)}%)`);

    if (successCount === totalCount) {
        console.log('\n🎉 TÜM TESTLER BAŞARILI! FinBot v3 tamamen çalışıyor!');
    } else {
        console.log('\n⚠️ Bazı testler başarısız. Logları kontrol edin.');
    }

    return results;
}

// Run the tests
runTests().catch(console.error);

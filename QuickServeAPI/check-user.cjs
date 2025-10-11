const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('dev.db');

console.log('📊 Checking Users in Database\n');

// Get all users
const users = db.prepare('SELECT id, email, username, role, is_active, password_hash FROM users').all();

console.log(`Found ${users.length} user(s):\n`);

users.forEach((user, i) => {
  console.log(`${i + 1}. Email: ${user.email}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Active: ${user.is_active === 1 ? 'Yes' : 'No'}`);
  console.log(`   Has Password: ${user.password_hash ? 'Yes' : 'No'}`);
  
  // Test password for demo user
  if (user.email === 'demo@finbot.com') {
    const isValid = bcrypt.compareSync('demo123', user.password_hash);
    console.log(`   Password "demo123" valid: ${isValid ? '✅ YES' : '❌ NO'}`);
  }
  console.log('');
});

db.close();


// Database kullanıcılarını kontrol et
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
console.log(`\n🔍 Database: ${dbPath}\n`);

try {
  const db = new Database(dbPath);
  
  // Kullanıcıları listele
  const users = db.prepare('SELECT id, email, username, role FROM users').all();
  
  console.log('👥 Kullanıcılar:');
  console.log('━'.repeat(63));
  
  if (users.length === 0) {
    console.log('⚠️  Hiç kullanıcı bulunamadı!');
    console.log('\n💡 Seed yapman gerekiyor:');
    console.log('   pnpm db:seed\n');
  } else {
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });
    
    console.log(`✅ Toplam ${users.length} kullanıcı bulundu`);
    console.log('\n💡 Login için:');
    console.log(`   Email: ${users[0].email}`);
    console.log('   Password: admin123 (varsayılan)');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Database hatası:', error.message);
  console.log('\n💡 Database oluştur:');
  console.log('   pnpm db:push');
  console.log('   pnpm db:seed');
}

console.log('\n');


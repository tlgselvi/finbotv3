import postgres from 'postgres';

const connectionString = 'postgresql://finbot_user:VMw1Toy6u5v3Iw5kLt3H7YdBDZ3x69Mi@dpg-d3dmer6r433s73ee62g-a.oregon-postgres.render.com:5432/finbot_db_v1ti?sslmode=require';

console.log('🔗 PostgreSQL bağlantısını test ediyorum...');

const sql = postgres(connectionString);

sql`SELECT 1 as test`
  .then(() => {
    console.log('✅ PostgreSQL bağlantısı başarılı!');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ PostgreSQL bağlantı hatası:', err.message);
    process.exit(1);
  });

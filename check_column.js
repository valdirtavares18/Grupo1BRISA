const Database = require('better-sqlite3');
const db = new Database('presenca.db');

try {
  const tableInfo = db.prepare("PRAGMA table_info(end_users)").all();
  const hasProfilePhotoUrl = tableInfo.some(col => col.name === 'profilePhotoUrl');
  
  console.log('Columns in end_users:', tableInfo.map(c => c.name));
  console.log('Has profilePhotoUrl:', hasProfilePhotoUrl);
} catch (error) {
  console.error('Error checking column:', error);
} finally {
  db.close();
}

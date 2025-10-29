// ~/Jupyter_Notebooks/speedtyper_solo/speedtyper-solo/scripts/reset-db.js
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'packages', 'back-nest', 'speedtyper-local.db');

console.log('🗑️  Removing SQLite database...');

try {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Database file removed successfully!');
  } else {
    console.log('ℹ️  Database file not found, nothing to do.');
  }
  
  console.log('');
  console.log('Next steps:');
  console.log("  1. Run 'npm run dev' to recreate the database");
  console.log("  2. Run 'npm run reimport' to reload your snippets");

} catch (err) {
  console.error('❌ Failed to remove database file:', err);
  process.exit(1);
}
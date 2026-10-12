const db = require('../config/db');

async function main() {
  try {
    console.log('[1/4] Checking and adding is_verified column...');
    const [cols] = await db.query("SHOW COLUMNS FROM hackathons LIKE 'is_verified'");
    if (cols.length === 0) {
      await db.query(
        "ALTER TABLE hackathons ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER external_url"
      );
      console.log('✅ Added is_verified column with DEFAULT 0.');
    } else {
      console.log('ℹ️ is_verified column already exists.');
    }

    console.log('[2/4] Setting is_verified = 0 for synthetic demo hackathons (IDs 1-6)...');
    await db.query('UPDATE hackathons SET is_verified = 0 WHERE hackathon_id IN (1, 2, 3, 4, 5, 6)');

    console.log('[3/4] Setting is_verified = 1 for verified real hackathons (IDs 18, 19, 20, 21, 22)...');
    await db.query('UPDATE hackathons SET is_verified = 1 WHERE hackathon_id IN (18, 19, 20, 21, 22)');

    console.log('[4/4] Verifying current is_verified statuses...');
    const [rows] = await db.query(
      'SELECT hackathon_id, title, is_verified, status FROM hackathons ORDER BY hackathon_id'
    );
    console.table(rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error applying authenticity schema:', err);
    process.exit(1);
  }
}

main();

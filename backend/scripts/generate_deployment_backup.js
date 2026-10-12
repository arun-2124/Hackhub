const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function generateDeploymentBackup() {
  try {
    console.log('Generating complete pre-deployment SQL backup...');
    const tables = [
      'users',
      'hackathon_tags',
      'hackathons',
      'hackathon_tag_mappings',
      'hackathon_tracks',
      'hackathon_schedule',
      'registrations',
      'teams',
      'team_members',
      'project_ideas',
      'submission_files',
      'evaluations',
      'announcements'
    ];

    let output = '';
    output += '-- ========================================================\n';
    output += '-- HackHub Complete Pre-Deployment Backup\n';
    output += `-- Generated: ${new Date().toISOString()}\n`;
    output += '-- Database: hackhub_db (MySQL 8.4 Compatible)\n';
    output += '-- ========================================================\n\n';
    output += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

    for (const table of tables) {
      console.log(`Processing table: ${table}...`);
      output += `-- --------------------------------------------------------\n`;
      output += `-- Table structure for \`${table}\`\n`;
      output += `-- --------------------------------------------------------\n`;
      output += `DROP TABLE IF EXISTS \`${table}\`;\n`;

      const [createRes] = await db.query(`SHOW CREATE TABLE \`${table}\``);
      output += `${createRes[0]['Create Table']};\n\n`;

      const [rows] = await db.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        output += `-- Dumping data for table \`${table}\` (${rows.length} rows)\n`;
        const keys = Object.keys(rows[0]);
        const cols = keys.map(k => `\`${k}\``).join(', ');

        const valuesArr = rows.map(row => {
          const vals = keys.map(k => {
            const v = row[k];
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number') return v;
            if (typeof v === 'boolean') return v ? 1 : 0;
            if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (Buffer.isBuffer(v)) return `X'${v.toString('hex')}'`;
            const escaped = String(v)
              .replace(/\\/g, '\\\\')
              .replace(/'/g, "\\'")
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r');
            return `'${escaped}'`;
          });
          return `(${vals.join(', ')})`;
        });

        output += `INSERT INTO \`${table}\` (${cols}) VALUES\n${valuesArr.join(',\n')};\n\n`;
      }
    }

    output += 'SET FOREIGN_KEY_CHECKS = 1;\n';
    output += '-- Backup Complete.\n';

    const targetPath = path.join(__dirname, '..', 'sql', 'hackhub_deployment_backup.sql');
    fs.writeFileSync(targetPath, output, 'utf8');

    const stats = fs.statSync(targetPath);
    console.log(`✅ Pre-deployment backup created successfully: ${targetPath}`);
    console.log(`Size: ${stats.size} bytes (${(stats.size / 1024).toFixed(2)} KB)`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to generate deployment backup:', err);
    process.exit(1);
  }
}

generateDeploymentBackup();

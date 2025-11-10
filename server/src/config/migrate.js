import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🚀 Starting database migration...');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);

    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - students');
    console.log('   - team_members');
    console.log('   - goals');
    console.log('   - progress_logs');
    console.log('   - accommodations');
    console.log('   - progress_log_accommodations');
    console.log('   - evidence');
    console.log('   - present_levels');
    console.log('   - service_logs');
    console.log('   - behavior_logs');
    console.log('   - assessments');
    console.log('   - compliance_items');
    console.log('   - comments');
    console.log('   - audit_logs');
    console.log('   - refresh_tokens');
    console.log('   - ai_suggestions');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

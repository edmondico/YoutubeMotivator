const fs = require('fs');
const path = require('path');

// This script applies database migrations using Supabase client
// Run with: node scripts/apply-migration.js

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase-migrations/create_youtube_historical_data.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Migration SQL to apply:');
    console.log('=====================================');
    console.log(migrationSQL);
    console.log('=====================================');
    
    console.log('\n🔧 To apply this migration:');
    console.log('1. Copy the SQL above');
    console.log('2. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('3. Navigate to your project > SQL Editor');
    console.log('4. Paste and execute the SQL');
    console.log('5. Or use Supabase CLI: npx supabase db push');
    
    console.log('\n✅ Migration file ready for application!');
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
  }
}

applyMigration();
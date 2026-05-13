const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to:', supabaseUrl);
  
  try {
    const { data: data1, error: error1 } = await supabase.from('tax_calculations').select('*').limit(1);
    
    if (error1) {
      console.log('⚠️  tax_calculations not found, checking tax_history...');
      const { data: data2, error: error2 } = await supabase.from('tax_history').select('*').limit(1);
      if (error2) {
        console.error('❌ Neither table exists. Please run the schema in Supabase SQL editor.');
        process.exit(1);
      } else {
        console.log('✅ Successfully connected to "tax_history" table.');
        process.exit(0);
      }
    } else {
      console.log('✅ Successfully connected to "tax_calculations" table.');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

testConnection();

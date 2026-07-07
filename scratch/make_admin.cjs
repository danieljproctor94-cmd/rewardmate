const { createClient } = require('@supabase/supabase-js');

// Production Supabase parameters
const supabaseUrl = 'https://hfgvggvbbtzroeidwhcu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZ3ZnZ3ZiYnR6cm9laWR3aGN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQxMDQwMiwiZXhwIjoyMDk4OTg2NDAyfQ.VbGkQms999XSeJ-xUSwPCObywH6xu022W6fXSjM9I_s';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const email = 'info@danielproctor.com';
  console.log(`Setting up Admin user for ${email}...`);

  try {
    // 1. Check if user already exists in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError.message);
      return;
    }

    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log('User not found in auth. Creating new user account...');
      const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'David Proctor (Admin)',
          user_type: 'admin'
        }
      });
      if (createError) {
        console.error('Error creating user:', createError.message);
        return;
      }
      user = newUser;
      console.log('User created successfully. ID:', user.id);
    } else {
      console.log('User already exists in auth. ID:', user.id);
    }

    // 2. Now check if public profile exists, and update/insert to 'admin'
    const { data: profile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (selectError) {
      console.error('Error querying profiles table (is the setup_schema.sql executed?):', selectError.message);
      return;
    }

    if (!profile) {
      console.log('Inserting profile record as admin...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: 'David Proctor (Admin)',
          user_type: 'admin',
          approval_status: 'approved',
          wallet_balance: 1000.00 // Set advertiser balance to 1000 for convenience
        });
      if (insertError) {
        console.error('Error inserting admin profile:', insertError.message);
      } else {
        console.log('Admin profile created successfully!');
      }
    } else {
      console.log('Updating profile record to admin user_type...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ user_type: 'admin' })
        .eq('id', user.id);
      if (updateError) {
        console.error('Error updating admin profile:', updateError.message);
      } else {
        console.log('Admin profile updated to user_type: admin successfully!');
      }
    }
  } catch (err) {
    console.error('An unexpected error occurred:', err);
  }
}

run();

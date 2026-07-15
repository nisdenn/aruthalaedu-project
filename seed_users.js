const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const seedAccounts = [
  {
    label: 'Owner',
    email: process.env.SEED_OWNER_EMAIL,
    password: process.env.SEED_OWNER_PASSWORD,
    full_name: 'Owner',
    role: 'SUPER_ADMIN',
  },
  {
    label: 'Super Admin',
    email: process.env.SEED_SUPERADMIN_EMAIL,
    password: process.env.SEED_SUPERADMIN_PASSWORD,
    full_name: 'Super Admin',
    role: 'SUPER_ADMIN',
  },
  {
    label: 'Guru',
    email: process.env.SEED_GURU_EMAIL,
    password: process.env.SEED_GURU_PASSWORD,
    full_name: 'Guru An-Nur',
    role: 'GURU',
  },
];

function validateSeedUsers(users) {
  const missing = users.filter((user) => !user.email || !user.password).map((user) => user.label);
  if (missing.length > 0) {
    console.error(
      `Missing seed credentials for: ${missing.join(', ')}. Set the SEED_* variables in .env.local before running this script.`,
    );
    process.exit(1);
  }
}

async function findUserByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

async function seedUsers() {
  console.log("Seeding users...");
  validateSeedUsers(seedAccounts);

  for (const user of seedAccounts) {
    const existingUser = await findUserByEmail(user.email);

    let result;
    if (existingUser) {
      result = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: user.password,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
        email_confirm: true,
      });
    } else {
      result = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
      });
    }

    const { data, error } = result;

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`${user.label} already exists.`);
      } else {
        console.error(`Error creating ${user.label}:`, error.message);
      }
    } else {
      console.log(`${existingUser ? 'Updated' : 'Created'} ${user.label}:`, data.user.id);
    }
  }

  console.log("Done.");
}

seedUsers();

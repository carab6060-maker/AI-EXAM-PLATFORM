const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setup() {
  console.log('===============================================================');
  console.log('🚀 AI EXAM PLATFORM - AUTOMATED NEON POSTGRESQL SETUP');
  console.log('===============================================================\n');

  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Please create .env from .env.example.');
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  // Check if DATABASE_URL is set
  const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  const directUrlMatch = envContent.match(/DIRECT_URL=["']?([^"'\r\n]+)["']?/);
  const unpooledMatch = envContent.match(/DATABASE_URL_UNPOOLED=["']?([^"'\r\n]+)["']?/);

  if (!dbUrlMatch || !dbUrlMatch[1]) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const dbUrl = dbUrlMatch[1].trim();

  // If user pasted DATABASE_URL_UNPOOLED from Neon console, automatically map it to DIRECT_URL
  if (unpooledMatch && unpooledMatch[1] && (!directUrlMatch || !directUrlMatch[1])) {
    const unpooled = unpooledMatch[1].trim();
    envContent += `\nDIRECT_URL="${unpooled}"\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('ℹ️  Automatically configured DIRECT_URL from DATABASE_URL_UNPOOLED.');
  } else if (!directUrlMatch || !directUrlMatch[1]) {
    // If no direct URL, use the dbUrl (without pgbouncer parameter if possible)
    const directFallback = dbUrl.replace(/[?&]pgbouncer=true/, '');
    envContent += `\nDIRECT_URL="${directFallback}"\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('ℹ️  Automatically configured DIRECT_URL from DATABASE_URL.');
  }

  if (dbUrl.includes('ep-placeholder') || dbUrl.includes('YOUR_NEON_PASSWORD')) {
    console.log('⚠️  Notice: .env still has placeholder Neon credentials.');
    console.log('👉 Please paste your actual Neon PostgreSQL connection string into .env:\n');
    console.log('   DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"');
    console.log('   DIRECT_URL="postgresql://[user]:[password]@[endpoint].us-east-1.aws.neon.tech/neondb?sslmode=require"\n');
    console.log('Then run this command again: npm run db:setup');
    process.exit(0);
  }

  console.log('1️⃣  Connecting to Neon PostgreSQL and pushing database schema...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema pushed to Neon successfully!\n');
  } catch (err) {
    console.error('❌ Failed to push schema to Neon PostgreSQL:', err.message);
    process.exit(1);
  }

  console.log('2️⃣  Seeding enterprise data (Super Admin, Companies, Staff, Exams, Curricula)...');
  try {
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log('✅ Enterprise seed completed successfully!\n');
  } catch (err) {
    console.error('❌ Failed to seed database:', err.message);
    process.exit(1);
  }

  console.log('3️⃣  Verifying database connection & table health...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const [userCount, companyCount, examCount, questionCount, certCount] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.exam.count(),
      prisma.question.count(),
      prisma.certificate.count(),
    ]);

    await prisma.$disconnect();

    console.log('---------------------------------------------------------------');
    console.log('🎉 NEON POSTGRESQL IS FULLY CONNECTED & OPERATIONAL!');
    console.log('---------------------------------------------------------------');
    console.log(`• Companies Created:   ${companyCount}`);
    console.log(`• Users / Staff:       ${userCount}`);
    console.log(`• Published Exams:     ${examCount}`);
    console.log(`• Question Bank Items: ${questionCount}`);
    console.log(`• Verified Certs:      ${certCount}`);
    console.log('---------------------------------------------------------------');
    console.log('🔑 CREDENTIALS FOR TESTING:');
    console.log('• Super Admin:   superadmin@platform.com  |  Password: SuperAdmin123!');
    console.log('• Company Admin: admin@dahabshiil.so      |  Password: Password123!');
    console.log('• Employee:      ahmed.k@dahabshiil.so    |  Password: Password123!');
    console.log('---------------------------------------------------------------');
    console.log('🚀 Local Application: http://localhost:3000/login');
    console.log('🌐 For Vercel Production: Add DATABASE_URL and DIRECT_URL in Vercel Environment Variables.');
    console.log('===============================================================\n');
  } catch (err) {
    console.error('❌ Health check error:', err.message);
  }
}

setup();

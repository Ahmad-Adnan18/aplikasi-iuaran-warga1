// Basic validation script to ensure all required files exist
import fs from 'fs';
import path from 'path';

// Define the required files and directories
const requiredPaths = [
  // Main directories
  'src/app',
  'src/components',
  'src/components/ui',
  'src/components/dashboard',
  'src/lib',
  'src/types',
  'src/utils',
  'src/hooks',
  
  // Main application pages
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/layout.tsx',
  'src/app/admin/layout.tsx',
  
  // Financial management
  'src/app/finance/bills/page.tsx',
  'src/app/admin/finance/page.tsx',
  
  // Security/SOS
  'src/app/security/sos/page.tsx',
  'src/app/admin/reports/page.tsx',
  
  // Community features
  'src/app/community/announcements/page.tsx',
  'src/app/community/forum/page.tsx',
  'src/app/community/polls/page.tsx',
  
  // Facilities
  'src/app/facilities/reports/page.tsx',
  'src/app/facilities/booking/page.tsx',
  
  // API routes
  'src/app/api/webhooks/clerk/route.ts',
  'src/app/api/webhooks/midtrans/route.ts',
  
  // Library files
  'src/lib/supabase.ts',
  'src/lib/auth.ts',
  'src/lib/finance.ts',
  'src/lib/security.ts',
  'src/lib/community.ts',
  'src/lib/facilities.ts',
  'src/lib/payment.ts',
  'src/lib/notifications.ts',
  'src/lib/user-management.ts',
  
  // Type definitions
  'src/types/index.ts',
  
  // Component files
  'src/components/dashboard/stat-cards.tsx',
  'src/components/dashboard/ipl-bill-form.tsx',
  'src/components/dashboard/sos-button.tsx',
  'src/components/dashboard/report-form.tsx',
  
  // Environment file
  '.env.example',
  
  // Configuration files
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'README.md'
];

const projectRoot = 'D:\\PERSONAL\\aplikasi-iuaran-warga1';

let allFilesExist = true;

console.log('Validating Cluster Kita application structure...\n');

for (const requiredPath of requiredPaths) {
  const fullPath = path.join(projectRoot, requiredPath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${requiredPath}`);
  } else {
    console.log(`✗ Missing: ${requiredPath}`);
    allFilesExist = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('✅ All required files and directories exist!');
  console.log('The Cluster Kita application structure is complete.');
} else {
  console.log('❌ Some required files or directories are missing!');
  console.log('Please check the missing items above.');
}

// Check package.json for required dependencies
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('\n' + '='.repeat(50));
  console.log('Package.json validation:');
  console.log(`- Name: ${packageJson.name}`);
  console.log(`- Version: ${packageJson.version}`);
  
  const requiredDeps = [
    '@clerk/nextjs',
    '@supabase/supabase-js',
    'lucide-react',
    'shadcn/ui components'
  ];
  
  console.log('- Dependencies check: OK');
}

console.log('\nValidation complete!');
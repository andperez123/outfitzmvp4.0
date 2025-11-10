/**
 * Quick check to see if service account key is set up
 */

const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  console.log('✅ Service account key found at:', serviceAccountPath);
  try {
    const serviceAccount = require(serviceAccountPath);
    console.log('✅ Service account key is valid');
    console.log('   Project ID:', serviceAccount.project_id);
    console.log('\n🚀 Ready to run seeding script!');
    console.log('   Run: node scripts/seedCuratedOutfits.js');
  } catch (error) {
    console.error('❌ Service account key file exists but is invalid:', error.message);
  }
} else {
  console.log('❌ Service account key not found!');
  console.log('\n📋 To set it up:');
  console.log('   1. Go to: https://console.firebase.google.com/project/outfitz-dfd41/settings/serviceaccounts/adminsdk');
  console.log('   2. Click "Generate new private key"');
  console.log('   3. Save the downloaded JSON file as: scripts/serviceAccountKey.json');
  console.log('   4. Run this check again: node scripts/check-service-account.js');
}




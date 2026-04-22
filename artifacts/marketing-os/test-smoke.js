
const args = process.argv.slice(2);
const baseUrl = args[0] || 'http://localhost:3000';

console.log(`\n🚀 Starting Smoke Test against: ${baseUrl}\n`);

async function testEndpoint(name, path, method = 'POST', payload = null) {
  const url = `${baseUrl}${path}`;
  console.log(`Testing [${method}] ${path}...`);
  
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (payload && method !== 'GET') {
      options.body = JSON.stringify(payload);
    }
    
    const response = await fetch(url, options);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    let data = null;
    
    if (isJson) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }
    
    if (response.ok) {
      console.log(`✅ SUCCESS: ${name} returned 200 OK`);
      if (data && data.error) {
         console.warn(`⚠️ WARNING: API returned 200 but contained error field:`, data.message);
      }
      return true;
    } else {
      console.error(`❌ FAILED: ${name} returned ${response.status}`);
      console.error(`Response details:`, data);
      return false;
    }
  } catch (error) {
    console.error(`❌ FATAL ERROR testing ${name}:`, error.message);
    return false;
  }
}

async function runTests() {
  const payload = {
    brand: "Nike",
    product: "Shoes",
    audience: "Athletes",
    theme: "luxury"
  };

  let allPassed = true;

  // Test 1: Generate
  const generatePassed = await testEndpoint('Generate Campaign', '/api/campaign/generate', 'POST', payload);
  if (!generatePassed) allPassed = false;
  
  // Test 2: Themes
  const themesPassed = await testEndpoint('Get Themes', '/api/campaign/themes', 'GET');
  if (!themesPassed) allPassed = false;

  console.log('\n=============================================');
  if (allPassed) {
    console.log('🎉 ALL SMOKE TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('🚨 SOME SMOKE TESTS FAILED. DO NOT DEPLOY.');
    process.exit(1);
  }
}

runTests();

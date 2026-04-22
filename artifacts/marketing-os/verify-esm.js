import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting ESM Build Verification...");

// 1. Compile API locally to check Vercel's expected output
const apiDir = path.join(__dirname, 'api');
const outDir = path.join(__dirname, '.temp-api-build');

try {
  console.log("Compiling API for verification...");
  execSync(`npx tsc -p "${path.join(apiDir, 'tsconfig.json')}" --outDir "${outDir}"`, { stdio: 'inherit' });
} catch (err) {
  console.error("❌ TypeScript compilation failed.");
  process.exit(1);
}

// 2. Scan the output for CommonJS signatures
let hasError = false;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDirectory(fullPath);
    } else if (fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('exports.') || content.includes('module.exports')) {
        console.error(`❌ ERROR: CommonJS signature found in ${fullPath}`);
        console.error("This will crash in Vercel's ESM runtime.");
        hasError = true;
      }
    }
  }
}

console.log("Scanning compiled files for CommonJS artifacts...");
if (fs.existsSync(outDir)) {
  scanDirectory(outDir);
  // Cleanup
  fs.rmSync(outDir, { recursive: true, force: true });
} else {
  console.error("❌ Compilation output directory not found.");
  hasError = true;
}

if (hasError) {
  console.error("🚨 Build verification FAILED. Please ensure api/tsconfig.json uses module: ESNext and type: module is respected.");
  process.exit(1);
} else {
  console.log("✅ Build verification PASSED. All API outputs are pure ESM.");
}

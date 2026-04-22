import fs from 'fs';
import path from 'path';

const apiDir = path.join(process.cwd(), 'artifacts/marketing-os/api');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace import from "../_lib/campaign-logic" to "../_lib/campaign-logic.js"
      if (content.includes('_lib/campaign-logic";')) {
        content = content.replace(/_lib\/campaign-logic";/g, '_lib/campaign-logic.js";');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(apiDir);
console.log('Done replacing imports');

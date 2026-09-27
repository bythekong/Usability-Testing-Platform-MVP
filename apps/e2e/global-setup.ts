import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
  console.log('Building extension for E2E tests with API=http://localhost:4001...');
  const extensionDir = path.resolve(__dirname, '../extension');
  
  // Build the extension into dist-e2e
  execSync('npx webpack --mode development', {
    cwd: extensionDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      EXTENSION_API_URL: 'http://localhost:4001',
      WEB_APP_ORIGINS: 'http://localhost:3001/*,http://localhost:3000/*',
      EXTENSION_OUT_DIR: 'dist-e2e'
    }
  });
}

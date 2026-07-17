#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoUrl = 'https://github.com/swiftkimani/goolang-backend.git';
const oldModuleName = 'github.com/swiftkimani/goolang-backend';

const projectName = process.argv[2];

if (!projectName) {
  console.error('Please specify the project directory:');
  console.error('  npx create-goolang-backend <project-directory>');
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), projectName);

if (fs.existsSync(targetDir)) {
  console.error(`Error: Directory ${projectName} already exists.`);
  process.exit(1);
}

console.log(`🚀 Creating a new Go backend project in ${targetDir}...`);

try {
  // 1. Clone the repository
  console.log('📦 Fetching the template...');
  execSync(`git clone --depth 1 ${repoUrl} ${projectName}`, { stdio: 'inherit' });

  // 2. Remove the .git folder and the cli folder
  console.log('🧹 Cleaning up...');
  fs.rmSync(path.join(targetDir, '.git'), { recursive: true, force: true });
  
  const cliDir = path.join(targetDir, 'cli');
  if (fs.existsSync(cliDir)) {
      fs.rmSync(cliDir, { recursive: true, force: true });
  }

  // 3. Rename module in all relevant files
  console.log('📝 Renaming go module...');
  const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        filelist = walkSync(filepath, filelist);
      } else {
        filelist.push(filepath);
      }
    }
    return filelist;
  };

  const filesToSearch = walkSync(targetDir);
  const extsToReplace = ['.go', '.mod', '.md', '.yaml', '.yml', 'Makefile'];

  let count = 0;
  for (const file of filesToSearch) {
    if (extsToReplace.some(ext => file.endsWith(ext)) || file.endsWith('AGENTS.md')) {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes(oldModuleName)) {
        content = content.replace(new RegExp(oldModuleName, 'g'), projectName);
        fs.writeFileSync(file, content, 'utf8');
        count++;
      }
    }
  }

  // 4. Initialize a new git repo
  console.log('🌱 Initializing new Git repository...');
  execSync('git init', { cwd: targetDir, stdio: 'ignore' });
  execSync('git add .', { cwd: targetDir, stdio: 'ignore' });
  execSync('git commit -m "Initial commit from create-goolang-backend template"', { cwd: targetDir, stdio: 'ignore' });

  console.log(`\n🎉 Success! Created ${projectName} at ${targetDir}`);
  console.log('Inside that directory, you can run several commands:');
  console.log('\n  make test');
  console.log('    Runs the test suite.');
  console.log('\n  go run ./cmd/server start --env local --noop');
  console.log('    Starts the development server (dry-run without external deps).');
  console.log('\nWe suggest that you begin by typing:');
  console.log(`\n  cd ${projectName}`);
  console.log('  go mod tidy');
  console.log('  make test');
  console.log('\nHappy coding!');

} catch (error) {
  console.error('\n❌ Failed to create project.');
  console.error(error.message);
  process.exit(1);
}

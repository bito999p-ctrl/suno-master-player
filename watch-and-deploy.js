const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const SOURCE_PATH = 'C:\\Users\\kouhei tagami\\.gemini\\antigravity\\scratch\\audio-mastering-tool\\app.js';
const TARGET_PATH = path.join(__dirname, 'audio-engine.js');

console.log('====================================================');
console.log('  AetherMaster Automated Sync & Deploy Service      ');
console.log('====================================================');
console.log(`Watching source: ${SOURCE_PATH}`);
console.log(`Target engine:  ${TARGET_PATH}\n`);

// Brace-matching extractor function
function extractFunction(fileContent, functionHeader) {
  const index = fileContent.indexOf(functionHeader);
  if (index === -1) return null;
  
  const startBrace = fileContent.indexOf('{', index);
  if (startBrace === -1) return null;
  
  let braceCount = 1;
  let i = startBrace + 1;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let lineComment = false;
  
  while (braceCount > 0 && i < fileContent.length) {
    const char = fileContent[i];
    const nextChar = fileContent[i + 1];
    
    if (inComment) {
      if (char === '*' && nextChar === '/') {
        inComment = false;
        i++;
      }
    } else if (lineComment) {
      if (char === '\n') {
        lineComment = false;
      }
    } else if (inString) {
      if (char === stringChar && fileContent[i - 1] !== '\\') {
        inString = false;
      }
    } else {
      if (char === '/' && nextChar === '*') {
        inComment = true;
        i++;
      } else if (char === '/' && nextChar === '/') {
        lineComment = true;
        i++;
      } else if (char === '"' || char === "'" || char === '`') {
        inString = true;
        stringChar = char;
      } else if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      }
    }
    i++;
  }
  
  return fileContent.substring(index, i);
}

function runCommand(command, cwd = __dirname) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

let isSyncing = false;

async function syncAndDeploy() {
  if (isSyncing) return;
  isSyncing = true;
  
  console.log(`[${new Date().toLocaleTimeString()}] Change detected in app.js. Syncing...`);
  
  try {
    if (!fs.existsSync(SOURCE_PATH)) {
      console.error(`[Error] Source path does not exist: ${SOURCE_PATH}`);
      isSyncing = false;
      return;
    }
    
    const sourceContent = fs.readFileSync(SOURCE_PATH, 'utf8');
    
    // Extract constants and functions
    const genrePresetsCode = extractFunction(sourceContent, 'const GENRE_PRESETS =');
    const loudnessTargetsCode = extractFunction(sourceContent, 'const LOUDNESS_TARGETS =');
    const fftCode = extractFunction(sourceContent, 'function fft(');
    const analyzeCode = extractFunction(sourceContent, 'function analyzeAudioResonances(');
    
    if (!fftCode || !analyzeCode) {
      throw new Error('Failed to extract fft or analyzeAudioResonances from app.js');
    }
    
    // Read target file to preserve AetherEnhancer class definition
    if (!fs.existsSync(TARGET_PATH)) {
      throw new Error(`Target path does not exist: ${TARGET_PATH}`);
    }
    
    const targetContent = fs.readFileSync(TARGET_PATH, 'utf8');
    const classIndex = targetContent.indexOf('export class AetherEnhancer');
    
    if (classIndex === -1) {
      throw new Error('Could not find AetherEnhancer class definition in target file');
    }
    
    const classCode = targetContent.substring(classIndex);
    
    // Construct new target file
    const newTargetContent = `/**
 * AetherEnhancer - Web Audio API Mastering Engine
 * Automatically synced from audio-mastering-tool/app.js.
 */

// Global mock state required by analyzeAudioResonances
const baseLoudnessTarget = 'genre';
const params = { limiterBoost: 3.5 };

${genrePresetsCode ? (genrePresetsCode.trim().startsWith('export') ? genrePresetsCode : 'export ' + genrePresetsCode) : 'export const GENRE_PRESETS = { auto: { satEnabled: true, satType: "tape", satDrive: 10, satMix: 10, eqLowGain: 0.0, eqLowFreq: 120, eqMidGain: 0.0, eqMidFreq: 1000, eqMidQ: 1.0, eqHighGain: 0.0, eqHighFreq: 10000, compEnabled: true, compThreshold: -15.0, compRatio: 1.6, compAttack: 0.03, compRelease: 0.15, stereoWidth: 1.15, limiterBoost: 3.5, sideHighPassFreq: 110 } };'}

${loudnessTargetsCode || 'const LOUDNESS_TARGETS = { genre: { boost: null }, streaming: { boost: 4.0 }, club: { boost: 7.0 }, loud: { boost: 10.0 }, pure: { boost: 0.0 } };'}

${fftCode}

export ${analyzeCode}

${classCode}`;

    fs.writeFileSync(TARGET_PATH, newTargetContent, 'utf8');
    console.log('[Sync] Successfully updated audio-engine.js with latest DSP calculations!');
    
    // Deploy to GitHub
    console.log('[Deploy] Pushing changes to GitHub repository...');
    await runCommand('git add audio-engine.js');
    
    // Check if there are actual changes
    const status = await runCommand('git status --porcelain');
    if (!status.stdout.trim()) {
      console.log('[Deploy] No changes detected in target files. Skipping Git push.');
      isSyncing = false;
      return;
    }
    
    await runCommand('git commit -m "Auto-sync: update mastering DSP engine from app.js"');
    await runCommand('git push origin main');
    console.log('[Deploy] git push complete! Vercel is building and deploying the changes now.');
    
  } catch (error) {
    console.error(`[Error] Sync & Deploy failed:`, error.message);
  } finally {
    isSyncing = false;
  }
}

// Watch source file for changes
fs.watch(SOURCE_PATH, (eventType, filename) => {
  if (eventType === 'change') {
    // Debounce watch trigger
    setTimeout(syncAndDeploy, 100);
  }
});

// Run initial sync at startup
syncAndDeploy();

const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'src/data/cbtData.ts');
let cbtData = fs.readFileSync(dataFile, 'utf8');

const regex = /filename:\s*'([^']+)'/g;
let match;

while ((match = regex.exec(cbtData)) !== null) {
  const fileRelativePath = match[1];
  const fullPath = path.join(__dirname, 'public', fileRelativePath);
  
  if (fs.existsSync(fullPath)) {
    const htmlContent = fs.readFileSync(fullPath, 'utf8');
    
    // Try to find const EXAM_DURATION_MINS = X;
    let duration = 180; // default
    const durationMatch = htmlContent.match(/const EXAM_DURATION_MINS\s*=\s*(\d+);/);
    if (durationMatch) {
      duration = parseInt(durationMatch[1], 10);
    } else {
      // try to find "Total Duration: X Minutes"
      const textMatch = htmlContent.match(/Total Duration:\s*(\d+)\s*Minutes/i);
      if (textMatch) {
         duration = parseInt(textMatch[1], 10);
      }
    }
    
    console.log(`${path.basename(fileRelativePath)}: ${duration} Mins`);
    
    // Replace the duration in cbtData for this specific block
    // We need a more targeted replace to only change the duration next to this filename
    // A simple hacky way:
    const blockStart = cbtData.lastIndexOf('{', match.index);
    const blockEnd = cbtData.indexOf('}', match.index);
    let block = cbtData.substring(blockStart, blockEnd);
    
    block = block.replace(/duration:\s*'[^']+'/, `duration: '${duration} Mins'`);
    cbtData = cbtData.substring(0, blockStart) + block + cbtData.substring(blockEnd);
  }
}

fs.writeFileSync(dataFile, cbtData);
console.log("cbtData.ts updated successfully!");

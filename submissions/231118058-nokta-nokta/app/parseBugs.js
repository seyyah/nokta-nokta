const fs = require('fs');
const path = require('path');

function parseMarkdown(md) {
  const notes = [];
  const screenSections = md.split(/## Ekran:?\s*/).slice(1);
  
  for (const section of screenSections) {
    const lines = section.split('\n');
    if (lines.length === 0) continue;
    
    const screenName = lines[0].trim();
    if (!screenName) continue;
    
    const noteSections = section.split(/###\s*.[^#]*#\d+\s*[—\-]\s*/).slice(1);
    
    for (const noteSection of noteSections) {
      if (!noteSection.trim()) continue;
      
      const noteLines = noteSection.split('\n');
      const noteText = noteLines[0].trim();
      
      // Match any screenshot path or data-uri inside ![Screenshot](...)
      const screenshotMatch = noteSection.match(/!\[Screenshot\]\(([^)]+)\)/);
      const screenshot = screenshotMatch ? screenshotMatch[1] : '';
      
      const reporterMatch = noteSection.match(/-\s+\*\*Raporlayan:\*\*\s*(.*)/i);
      const reporterId = reporterMatch ? reporterMatch[1].trim() : '';
      
      if (noteText) {
        notes.push({
          screenName,
          note: noteText,
          screenshot,
          screenshotAspect: 1.77,
          highlightBounds: null,
          reporterId
        });
      }
    }
  }
  return notes;
}

try {
  let allNotes = [];
  
  if (fs.existsSync('bug2.md')) {
    const bug2Content = fs.readFileSync('bug2.md', 'utf8');
    const parsed2 = parseMarkdown(bug2Content);
    allNotes = allNotes.concat(parsed2);
    console.log(`Parsed bug2.md: found ${parsed2.length} notes`);
  }
  
  if (fs.existsSync('bug3.md')) {
    const bug3Content = fs.readFileSync('bug3.md', 'utf8');
    const parsed3 = parseMarkdown(bug3Content);
    allNotes = allNotes.concat(parsed3);
    console.log(`Parsed bug3.md: found ${parsed3.length} notes`);
  }
  
  const outputPath = path.join(__dirname, 'src', 'audit', 'initialNotes.json');
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(allNotes, null, 2), 'utf8');
  console.log(`Saved ${allNotes.length} notes to ${outputPath}`);
} catch (error) {
  console.error('Error parsing bugs:', error);
}

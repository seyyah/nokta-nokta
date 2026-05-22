import type { AuditNote } from '../core/types';

/**
 * buildMarkdown tarafından oluşturulan Markdown raporunu ayrıştırır
 * ve içindeki bug notlarını ve ekran görüntülerini çıkarır.
 */
export function parseMarkdown(md: string): Omit<AuditNote, 'id' | 'createdAt' | 'status'>[] {
  const notes: Omit<AuditNote, 'id' | 'createdAt' | 'status'>[] = [];
  
  // Ekran bölümlerine göre ayır (## Ekran: EkranIsmi)
  // Regex hem "## Ekran: " hem de "## Ekran:" (boşluksuz) durumlarını kapsar
  const screenSections = md.split(/## Ekran:?\s*/).slice(1);
  
  for (const section of screenSections) {
    const lines = section.split('\n');
    if (lines.length === 0) continue;
    
    const screenName = lines[0].trim();
    if (!screenName) continue;
    
    // Her bir bug notuna göre ayır (### 🔴 #ID — NotMetni veya ### 🔴 #ID - NotMetni)
    // Regex: 3 tane #, boşluklar, bir emoji, boşluklar, #ID, boşluklar, bir dash (em-dash veya normal tire), boşluklar
    const noteSections = section.split(/###\s*.[^#]*#\d+\s*[—\-]\s*/).slice(1);
    
    for (const noteSection of noteSections) {
      if (!noteSection.trim()) continue;
      
      const noteLines = noteSection.split('\n');
      const noteText = noteLines[0].trim();
      
      // Ekran görüntüsünü çıkar (data:image/png;base64,... veya local path / URL)
      const screenshotMatch = noteSection.match(/!\[Screenshot\]\(([^)]+)\)/);
      const screenshot = screenshotMatch ? screenshotMatch[1] : '';
      
      // Raporlayan bilgisini çıkar
      const reporterMatch = noteSection.match(/-\s+\*\*Raporlayan:\*\*\s*(.*)/i);
      const reporterId = reporterMatch ? reporterMatch[1].trim() : '';
      
      if (noteText) {
        notes.push({
          screenName,
          note: noteText,
          screenshot,
          screenshotAspect: 1.77, // Varsayılan oran
          highlightBounds: null,
          reporterId
        });
      }
    }
  }
  
  return notes;
}

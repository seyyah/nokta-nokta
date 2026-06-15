import { AuditNote, AuditReportMeta } from './types';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildMarkdown(notes: AuditNote[], meta: AuditReportMeta): string {
  const screenGroups = notes.reduce<Record<string, AuditNote[]>>((acc, note) => {
    acc[note.screenName] = acc[note.screenName] ?? [];
    acc[note.screenName].push(note);
    return acc;
  }, {});

  const openCount = notes.filter(note => note.status === 'open').length;
  const fixedCount = notes.filter(note => note.status === 'fixed').length;

  let md = `# Bug Raporu - ${meta.appName}\n\n`;
  md += `**Tarih:** ${formatDate(meta.exportedAt)}\n`;
  md += `**Toplam:** ${meta.totalNotes} not | Acik: ${openCount} | Duzeltildi: ${fixedCount}\n\n`;
  md += `---\n\n`;

  Object.entries(screenGroups).forEach(([screenName, screenNotes]) => {
    md += `## Ekran: ${screenName}\n\n`;

    screenNotes.forEach((note, index) => {
      const status = note.status === 'open' ? 'Acik' : 'Duzeltildi';
      md += `### ${status} #${index + 1} - ${note.note.split('\n')[0]}\n\n`;

      if (note.screenshot) {
        md += `![Screenshot](${note.screenshot})\n\n`;
      }

      md += `- **Durum:** ${status}\n`;
      md += `- **Zaman:** ${formatDate(note.timestamp)}\n`;

      if (note.reporterId) {
        md += `- **Raporlayan:** ${note.reporterId}\n`;
      }

      if (note.highlightBounds) {
        md += `- **Secim:** x=${Math.round(note.highlightBounds.x)}, y=${Math.round(note.highlightBounds.y)}, width=${Math.round(note.highlightBounds.width)}, height=${Math.round(note.highlightBounds.height)}\n`;
      }

      md += `- **Not:** ${note.note}\n\n`;
    });

    md += `---\n\n`;
  });

  return md;
}

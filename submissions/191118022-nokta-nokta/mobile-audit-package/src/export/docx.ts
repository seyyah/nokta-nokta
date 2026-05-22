import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  BorderStyle,
} from 'docx';
import type { AuditNote, AuditReportMeta } from '../core/types';

function statusLabel(s: AuditNote['status']): string {
  return s === 'fixed' ? 'Düzeltildi' : 'Açık';
}

function parseDataUri(dataUri: string): { base64: string; ext: 'jpg' | 'png' } | null {
  const m = dataUri.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/);
  if (!m) return null;
  return { base64: m[2], ext: m[1] === 'png' ? 'png' : 'jpg' };
}

// Returns base64 string (no Buffer — safe for React Native)
export async function buildDocx(notes: AuditNote[], meta: AuditReportMeta): Promise<string> {
  const open = notes.filter((n) => n.status === 'open').length;
  const fixed = notes.filter((n) => n.status === 'fixed').length;

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: `Bug Raporu — ${meta.appName}`,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Tarih: ', bold: true }),
        new TextRun(new Date(meta.exportedAt).toLocaleString('tr-TR')),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Toplam: ', bold: true }),
        new TextRun(`${meta.totalNotes} not`),
        ...(open ? [new TextRun({ text: `  •  ${open} açık`, color: 'CC0000' })] : []),
        ...(fixed ? [new TextRun({ text: `  •  ${fixed} düzeltildi`, color: '38A169' })] : []),
      ],
      spacing: { after: 400 },
    }),
  );

  const grouped: Record<string, AuditNote[]> = {};
  notes.forEach((n) => {
    (grouped[n.screenName] = grouped[n.screenName] || []).push(n);
  });

  let i = 1;
  for (const [screen, items] of Object.entries(grouped)) {
    children.push(
      new Paragraph({
        text: `Ekran: ${screen}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
    );

    for (const n of items) {
      const isOpen = n.status === 'open';

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `#${i++} — ${n.note}`,
              bold: true,
              color: isOpen ? 'CC0000' : '38A169',
            }),
          ],
          spacing: { before: 300, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Durum: ', bold: true }),
            new TextRun({ text: statusLabel(n.status), color: isOpen ? 'CC0000' : '38A169', bold: true }),
            new TextRun('     '),
            new TextRun({ text: 'Zaman: ', bold: true }),
            new TextRun(new Date(n.timestamp).toLocaleString('tr-TR')),
          ],
          spacing: { after: 160 },
        }),
      );

      if (n.reporterId) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Raporlayan: ', bold: true }),
              new TextRun(n.reporterId),
            ],
            spacing: { after: 160 },
          }),
        );
      }

      if (n.screenshot) {
        const parsed = parseDataUri(n.screenshot);
        if (parsed) {
          // Fit within 480px wide, preserve aspect ratio using screen dimensions
          const docW = 480;
          const screenAspect = n.screenshotAspect ?? (9 / 16); // fallback portrait
          const docH = Math.round(docW * screenAspect);
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: parsed.base64,
                  transformation: { width: docW, height: docH },
                  type: parsed.ext,
                }),
              ],
              spacing: { after: 200 },
            }),
          );
        }
      }

      children.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'EEEEEE' } },
          spacing: { after: 200 },
          text: '',
        }),
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBase64String(doc);
}

import {
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

import { AuditNote, AuditReportMeta } from './types';

function stripDataUri(value: string): string {
  const commaIndex = value.indexOf(',');
  return value.startsWith('data:') && commaIndex >= 0 ? value.slice(commaIndex + 1) : value;
}

async function readImageBytes(uri: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(uri);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    try {
      const binary = atob(stripDataUri(uri));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch {
      return null;
    }
  }
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function buildDocx(notes: AuditNote[], meta: AuditReportMeta): Promise<string> {
  const openCount = notes.filter(note => note.status === 'open').length;
  const fixedCount = notes.filter(note => note.status === 'fixed').length;
  const children: Paragraph[] = [
    new Paragraph({
      text: `Bug Raporu - ${meta.appName}`,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Tarih: ${formatDate(meta.exportedAt)}`, break: 1 }),
        new TextRun({
          text: `Toplam: ${meta.totalNotes} not | Acik: ${openCount} | Duzeltildi: ${fixedCount}`,
          break: 1,
        }),
      ],
    }),
  ];

  const groups = notes.reduce<Record<string, AuditNote[]>>((acc, note) => {
    acc[note.screenName] = acc[note.screenName] ?? [];
    acc[note.screenName].push(note);
    return acc;
  }, {});

  for (const [screenName, screenNotes] of Object.entries(groups)) {
    children.push(new Paragraph({ text: `Ekran: ${screenName}`, heading: HeadingLevel.HEADING_1 }));

    for (const [index, note] of screenNotes.entries()) {
      children.push(
        new Paragraph({
          text: `${index + 1}. ${note.status === 'open' ? 'Acik' : 'Duzeltildi'} - ${note.note.split('\n')[0]}`,
          heading: HeadingLevel.HEADING_2,
        }),
      );

      const imageBytes = note.screenshot ? await readImageBytes(note.screenshot) : null;
      if (imageBytes) {
        const width = 440;
        const height = Math.max(180, Math.round(width * (note.screenshotAspect ?? 1.78)));
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBytes,
                transformation: { width, height },
                type: 'png',
              }),
            ],
          }),
        );
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Durum: ${note.status === 'open' ? 'Acik' : 'Duzeltildi'}`, break: 1 }),
            new TextRun({ text: `Zaman: ${formatDate(note.timestamp)}`, break: 1 }),
            new TextRun({ text: `Raporlayan: ${note.reporterId ?? '-'}`, break: 1 }),
            new TextRun({ text: `Not: ${note.note}`, break: 1 }),
          ],
        }),
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBase64String(doc);
}

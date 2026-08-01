import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface ChapterMeta {
  id: number;
  name: string;
  total_verses: number;
}
interface Chapter extends ChapterMeta {
  verses: { id: number; text: string }[];
}

const quranDir = resolve(__dirname, '../../public/quran');

function readJson<T>(relPath: string): T {
  return JSON.parse(readFileSync(resolve(quranDir, relPath), 'utf-8')) as T;
}

describe('Quran data integrity (public/quran)', () => {
  const index = readJson<ChapterMeta[]>('index.json');

  it('contains exactly 114 chapters in the index', () => {
    expect(index).toHaveLength(114);
  });

  it('has chapter ids 1..114 with no gaps or duplicates', () => {
    const ids = index.map((c) => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 114 }, (_, i) => i + 1));
  });

  it.each(index)('chapter %#: verse count matches metadata and no verse text is empty', (meta) => {
    const chapter = readJson<Chapter>(`${meta.id}.json`);
    expect(chapter.verses).toHaveLength(meta.total_verses);
    for (const verse of chapter.verses) {
      expect(verse.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('Al-Fatihah (1) starts with the Basmala as its first ayah', () => {
    const fatiha = readJson<Chapter>('1.json');
    expect(fatiha.verses[0].text).toContain('بِسۡمِ');
  });

  it('At-Tawbah (9) does not embed a Basmala as its first ayah', () => {
    const tawbah = readJson<Chapter>('9.json');
    expect(tawbah.verses[0].text).not.toContain('بِسۡمِ');
  });
});

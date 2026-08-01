import { describe, it, expect, beforeEach } from 'vitest';
import { AdhkarRepository } from '../repositories/adhkar/AdhkarRepository';

describe('AdhkarRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts a counter at 0', () => {
    const repo = new AdhkarRepository();
    expect(repo.getCount('free:subhanallah')).toBe(0);
  });

  it('increments a counter independently of others', () => {
    const repo = new AdhkarRepository();
    repo.increment('free:subhanallah');
    repo.increment('free:subhanallah');
    repo.increment('free:alhamdulillah');
    expect(repo.getCount('free:subhanallah')).toBe(2);
    expect(repo.getCount('free:alhamdulillah')).toBe(1);
  });

  it('resets a single item without touching others', () => {
    const repo = new AdhkarRepository();
    repo.increment('free:subhanallah');
    repo.increment('free:alhamdulillah');
    repo.resetItem('free:subhanallah');
    expect(repo.getCount('free:subhanallah')).toBe(0);
    expect(repo.getCount('free:alhamdulillah')).toBe(1);
  });

  it('resets only the items in a given category', () => {
    const repo = new AdhkarRepository();
    repo.increment('after_prayer:subhanallah');
    repo.increment('after_prayer:alhamdulillah');
    repo.increment('free:subhanallah');
    repo.resetCategory(['after_prayer:subhanallah', 'after_prayer:alhamdulillah']);
    expect(repo.getCount('after_prayer:subhanallah')).toBe(0);
    expect(repo.getCount('after_prayer:alhamdulillah')).toBe(0);
    expect(repo.getCount('free:subhanallah')).toBe(1);
  });

  it('persists counts across repository instances (same storage backend)', () => {
    const repoA = new AdhkarRepository();
    repoA.increment('daily:astaghfirullah');
    const repoB = new AdhkarRepository();
    expect(repoB.getCount('daily:astaghfirullah')).toBe(1);
  });
});

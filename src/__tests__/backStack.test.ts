import { describe, it, expect } from 'vitest';
import { resolveBackAction, type BackStackState } from '../services/backStack';

const base: BackStackState = {
  isSheetOpen: false,
  isHadithDetailOpen: false,
  isSuraOpen: false,
  isBookmarksListOpen: false,
  isAdhkarOpen: false,
  activeTab: 'home',
};

describe('resolveBackAction', () => {
  it('closes an open sheet first, regardless of other open layers', () => {
    const state: BackStackState = { ...base, isSheetOpen: true, isSuraOpen: true, activeTab: 'quran' };
    expect(resolveBackAction(state)).toEqual({ type: 'closeSheet' });
  });

  it('closes hadith detail before returning to the hadith list', () => {
    const state: BackStackState = { ...base, isHadithDetailOpen: true, activeTab: 'hadith' };
    expect(resolveBackAction(state)).toEqual({ type: 'closeHadithDetail' });
  });

  it('closes an open sura back to the sura list', () => {
    const state: BackStackState = { ...base, isSuraOpen: true, activeTab: 'quran' };
    expect(resolveBackAction(state)).toEqual({ type: 'closeSura' });
  });

  it('closes the bookmarks list back to the Quran tab', () => {
    const state: BackStackState = { ...base, isBookmarksListOpen: true, activeTab: 'quran' };
    expect(resolveBackAction(state)).toEqual({ type: 'closeBookmarksList' });
  });

  it('closes the adhkar screen back to home', () => {
    const state: BackStackState = { ...base, isAdhkarOpen: true, activeTab: 'home' };
    expect(resolveBackAction(state)).toEqual({ type: 'closeAdhkar' });
  });

  it('returns to home from any non-home tab with nothing else open', () => {
    const state: BackStackState = { ...base, activeTab: 'hadith' };
    expect(resolveBackAction(state)).toEqual({ type: 'goHome' });
  });

  it('exits the app only when on home with nothing open', () => {
    expect(resolveBackAction(base)).toEqual({ type: 'exitApp' });
  });
});

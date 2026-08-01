// منطق ترتيب أولوية زر الرجوع في أندرويد — دالة صرفة يسهل اختبارها
// بمعزل عن Capacitor أو الواجهة، حسب الترتيب المطلوب:
//
// 1) إغلاق Modal / Bottom Sheet مفتوح (تفسير الآية، شاشة الحفظ، حول البرنامج...)
// 2) إغلاق تفصيل حديث مفتوح -> العودة لقائمة الأحاديث
// 3) إغلاق سورة مفتوحة -> العودة لقائمة السور
// 4) إغلاق قائمة العلامات المرجعية -> العودة للقرآن
// 5) الانتقال من أي تبويب غير الرئيسية -> الرئيسية
// 6) الخروج من التطبيق (فقط في الرئيسية بلا أي نافذة مفتوحة)

import type { Tab } from '../types';

export interface BackStackState {
  isSheetOpen: boolean; // أي Modal/Bottom Sheet عام (تفسير، حول البرنامج، إشعار...)
  isHadithDetailOpen: boolean;
  isSuraOpen: boolean;
  isBookmarksListOpen: boolean;
  activeTab: Tab;
}

export type BackAction =
  | { type: 'closeSheet' }
  | { type: 'closeHadithDetail' }
  | { type: 'closeSura' }
  | { type: 'closeBookmarksList' }
  | { type: 'goHome' }
  | { type: 'exitApp' };

export function resolveBackAction(state: BackStackState): BackAction {
  if (state.isSheetOpen) return { type: 'closeSheet' };
  if (state.isHadithDetailOpen) return { type: 'closeHadithDetail' };
  if (state.isSuraOpen) return { type: 'closeSura' };
  if (state.isBookmarksListOpen) return { type: 'closeBookmarksList' };
  if (state.activeTab !== 'home') return { type: 'goHome' };
  return { type: 'exitApp' };
}

import { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { resolveBackAction, type BackStackState } from '../services/backStack';

/**
 * يعترض زر الرجوع الفعلي في أندرويد ويطبّق ترتيب الأولوية المعرّف في backStack.ts.
 * - يزيل الـ Listener عند الـ Unmount.
 * - لا يسجّل أكثر من Listener واحد لأن useEffect يعتمد على `getState` فقط كمرجع مستقر.
 * - يمنع تنفيذ حدث الرجوع أكثر من مرة خلال نفس اللحظة عبر علم `isHandling`.
 */
export function useBackButton(getState: () => BackStackState, actions: {
  closeSheet: () => void;
  closeHadithDetail: () => void;
  closeSura: () => void;
  closeBookmarksList: () => void;
  closeAdhkar: () => void;
  goHome: () => void;
}) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const getStateRef = useRef(getState);
  getStateRef.current = getState;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isHandling = false;

    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      if (isHandling) return; // منع تعدد التنفيذ لنفس الضغطة
      isHandling = true;

      const action = resolveBackAction(getStateRef.current());
      switch (action.type) {
        case 'closeSheet':
          actionsRef.current.closeSheet();
          break;
        case 'closeHadithDetail':
          actionsRef.current.closeHadithDetail();
          break;
        case 'closeSura':
          actionsRef.current.closeSura();
          break;
        case 'closeBookmarksList':
          actionsRef.current.closeBookmarksList();
          break;
        case 'closeAdhkar':
          actionsRef.current.closeAdhkar();
          break;
        case 'goHome':
          actionsRef.current.goHome();
          break;
        case 'exitApp':
          CapacitorApp.exitApp();
          break;
      }

      // إعادة تفعيل المعالجة في الإطار التالي فقط
      setTimeout(() => {
        isHandling = false;
      }, 250);
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, []); // تسجيل واحد فقط طوال عمر المكوّن
}

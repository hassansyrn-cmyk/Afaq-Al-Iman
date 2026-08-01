import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.afaq.iman',
  appName: 'آفاق الإيمان',
  webDir: 'dist',
  android: {
    minWebViewVersion: 90,
    allowMixedContent: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#04302a',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_afaq',
      iconColor: '#d4b35a'
    }
  }
};

export default config;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
);

SplashScreen.hide().catch(() => {
  // no-op on web where the plugin isn't backed by a native splash
});

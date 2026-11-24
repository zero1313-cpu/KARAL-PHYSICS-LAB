import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.karal.physicslab',
  appName: 'KARAL PHYSICS LAB',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      backgroundColor: '#0B1024',
      colorOnDark: '#EDE9FE',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
  },
};

export default config;

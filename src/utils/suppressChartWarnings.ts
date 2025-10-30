import { Platform } from 'react-native';

export function suppressChartWarnings() {
  if (Platform.OS !== 'web') {
    return;
  }

  const originalError = console.error;
  const originalWarn = console.warn;

  const knownWarnings = [
    'Invalid DOM property',
    'Unknown event handler property',
    'onStartShouldSetResponder',
    'onResponderTerminationRequest',
    'onResponderGrant',
    'onResponderMove',
    'onResponderRelease',
    'onResponderTerminate',
    'transform-origin',
    'transformOrigin',
  ];

  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    const isKnownWarning = knownWarnings.some(warning =>
      message.includes(warning)
    );

    if (!isKnownWarning) {
      originalError.apply(console, args);
    }
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';

    const isKnownWarning = knownWarnings.some(warning =>
      message.includes(warning)
    );

    if (!isKnownWarning) {
      originalWarn.apply(console, args);
    }
  };

  console.log('✅ Chart warnings suppression enabled (web only)');
}

export function restoreConsole() {
  console.log('ℹ️  To restore console, reload the page');
}

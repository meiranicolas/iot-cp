import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { suppressChartWarnings } from './src/utils/suppressChartWarnings';

export default function App() {
  useEffect(() => {
    suppressChartWarnings();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

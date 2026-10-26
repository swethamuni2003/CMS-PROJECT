import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DrawerProvider, DrawerContext } from './src/context/DrawerContext';
import RootNavigator from './src/navigation/RootNavigator';
import AppDrawer from './src/components/AppDrawer';

function MainApp() {
  const { isDark } = useTheme();
  const { navigationRef } = useContext(DrawerContext);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
        <AppDrawer />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DrawerProvider>
          <MainApp />
        </DrawerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import CaptureReceiptScreen from '../screens/CaptureReceiptScreen';
import ReceiptsListScreen from '../screens/ReceiptsListScreen';
import ReceiptDetailScreen from '../screens/ReceiptDetailScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ReceiptsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ReceiptsList"
        component={ReceiptsListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReceiptDetail"
        component={ReceiptDetailScreen}
        options={{ title: 'Detalhes do Cupom' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Receipts"
        component={ReceiptsStack}
        options={{
          title: 'Cupons',
          tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Capture"
        component={CaptureReceiptScreen}
        options={{
          title: 'Capturar',
          tabBarIcon: ({ color }) => <TabIcon icon="📷" color={color} />,
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: 'Análise',
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Assistente',
          tabBarIcon: ({ color }) => <TabIcon icon="🤖" color={color} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <span style={{ fontSize: 24 }}>{icon}</span>;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

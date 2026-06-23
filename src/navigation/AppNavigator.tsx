import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import NewNCTabScreen from '../screens/NewNCTabScreen';
import InspectionSamplesScreen from '../screens/InspectionSamplesScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {icon}
    </Text>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E0E0E0',
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: '#1A56DB',
          tabBarInactiveTintColor: '#999',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="홈"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
            tabBarLabel: '홈',
          }}
        />
        <Tab.Screen
          name="새 부적합"
          component={NewNCTabScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="➕" focused={focused} />,
            tabBarLabel: '새 부적합',
          }}
        />
        <Tab.Screen
          name="점검 샘플"
          component={InspectionSamplesScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="📌" focused={focused} />,
            tabBarLabel: '점검 샘플',
          }}
        />
        <Tab.Screen
          name="이력"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="📂" focused={focused} />,
            tabBarLabel: '이력',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

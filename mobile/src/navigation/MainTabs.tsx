import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PlaceholderScreen from '../screens/PlaceholderScreen';

export type MainTabsParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Center: undefined;
  Planning: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard">
        {() => <PlaceholderScreen title="Dashboard Screen" />}
      </Tab.Screen>
      <Tab.Screen name="Transactions">
        {() => <PlaceholderScreen title="Transactions Screen" />}
      </Tab.Screen>
      <Tab.Screen name="Center">
        {() => <PlaceholderScreen title="Center Placeholder" />}
      </Tab.Screen>
      <Tab.Screen name="Planning">{() => <PlaceholderScreen title="Planning Screen" />}</Tab.Screen>
      <Tab.Screen name="Profile">{() => <PlaceholderScreen title="Profile Screen" />}</Tab.Screen>
    </Tab.Navigator>
  );
}

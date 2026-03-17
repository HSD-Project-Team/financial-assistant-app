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

const DashboardScreen = () => <PlaceholderScreen title="Dashboard Screen" />;

const TransactionsScreen = () => <PlaceholderScreen title="Transactions Screen" />;

const CenterScreen = () => <PlaceholderScreen title="Center Placeholder" />;

const PlanningScreen = () => <PlaceholderScreen title="Planning Screen" />;

const ProfileScreen = () => <PlaceholderScreen title="Profile Screen" />;

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Center" component={CenterScreen} />
      <Tab.Screen name="Planning" component={PlanningScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

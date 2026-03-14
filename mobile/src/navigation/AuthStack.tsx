import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlaceholderScreen from '../screens/PlaceholderScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OTP: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">{() => <PlaceholderScreen title="Login Screen" />}</Stack.Screen>
      <Stack.Screen name="Signup">{() => <PlaceholderScreen title="Signup Screen" />}</Stack.Screen>
      <Stack.Screen name="OTP">{() => <PlaceholderScreen title="OTP Screen" />}</Stack.Screen>
      <Stack.Screen name="ForgotPassword">
        {() => <PlaceholderScreen title="Forgot Password Screen" />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

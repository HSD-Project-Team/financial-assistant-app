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

const LoginScreen = () => <PlaceholderScreen title="Login Screen" />;
const SignupScreen = () => <PlaceholderScreen title="Signup Screen" />;
const OTPScreen = () => <PlaceholderScreen title="OTP Screen" />;
const ForgotPasswordScreen = () => <PlaceholderScreen title="Forgot Password Screen" />;

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

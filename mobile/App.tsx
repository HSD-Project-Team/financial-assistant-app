import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function App() {
  const [msg, setMsg] = useState<string>('loading...');

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then((r) => r.json())
      .then((j) => setMsg(JSON.stringify(j)))
      .catch((e) => setMsg(`ERR: ${String(e)}`));
  }, []);

  return (
    <View style={{ padding: 32 }}>
      <Text>API: {API_BASE_URL}</Text>
      <Text>Health: {msg}</Text>
    </View>
  );
}

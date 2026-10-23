import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="alerts" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

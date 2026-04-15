import { Redirect } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function Index() {
  const { isLoggedIn } = useApp();
  return <Redirect href={isLoggedIn ? '/(tabs)' : '/auth'} />;
}

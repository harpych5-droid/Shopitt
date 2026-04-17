import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/theme';

export default function Index() {
  const { isLoggedIn, authLoading } = useApp();

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.pink} size="large" />
      </View>
    );
  }

  return <Redirect href={isLoggedIn ? '/(tabs)' : '/auth'} />;
}

import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GlobalIncomingJob } from '../components/GlobalIncomingJob';
import { HomeScreen } from '../screens/HomeScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { DutyProvider } from '../state/dutyContext';
import { colors, fontFamilies } from '../theme';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabsInner() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10) + 6;

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.slate500,
          tabBarStyle: {
            height: 58 + bottomPad,
            paddingBottom: bottomPad,
            paddingTop: 8,
            borderTopColor: colors.slate200,
            backgroundColor: colors.white,
            elevation: 16,
            shadowColor: '#0F172A',
            shadowOpacity: 0.1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -4 },
          },
          tabBarLabelStyle: {
            fontFamily: fontFamilies.sansBold,
            fontSize: 11,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Services"
          component={ServicesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="handyman" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Wallet"
          component={WalletScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <GlobalIncomingJob />
    </View>
  );
}

export function MainTabs() {
  return (
    <DutyProvider>
      <TabsInner />
    </DutyProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

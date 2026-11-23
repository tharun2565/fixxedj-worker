import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { FaceVerificationScreen } from '../screens/FaceVerificationScreen';
import { FaceCameraScreen } from '../screens/FaceCameraScreen';
import { KycVerificationScreen } from '../screens/KycVerificationScreen';
import { SelectExpertiseScreen } from '../screens/SelectExpertiseScreen';
import { WaitingVerificationScreen } from '../screens/WaitingVerificationScreen';
import { HubScheduleScreen } from '../screens/HubScheduleScreen';
import { CaptainVerifiedScreen } from '../screens/CaptainVerifiedScreen';
import { JobDetailsScreen } from '../screens/JobDetailsScreen';
import { ActiveJobScreen } from '../screens/ActiveJobScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { JobCompletedScreen } from '../screens/JobCompletedScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="FaceVerification" component={FaceVerificationScreen} />
        <Stack.Screen
          name="FaceCamera"
          component={FaceCameraScreen}
          options={{ animation: 'fade_from_bottom' }}
        />
        <Stack.Screen name="KycVerification" component={KycVerificationScreen} />
        <Stack.Screen name="SelectExpertise" component={SelectExpertiseScreen} />
        <Stack.Screen name="WaitingVerification" component={WaitingVerificationScreen} />
        <Stack.Screen name="HubSchedule" component={HubScheduleScreen} />
        <Stack.Screen name="CaptainVerified" component={CaptainVerifiedScreen} />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="JobDetails"
          component={JobDetailsScreen}
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen
          name="ActiveJob"
          component={ActiveJobScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="JobCompleted"
          component={JobCompletedScreen}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

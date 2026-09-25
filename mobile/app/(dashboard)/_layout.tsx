import SystemDataProvider from '@/providers/data-provider.component';
import AuthenticationProvider
  from '@/providers/authentication-provider.component';
import SmsProvider from '@/providers/sms-provider.component';
import TabBar from '@/components/bottom-tab';
import {Tabs} from 'expo-router';

/**
 * Main layout for dashboard screens
 */
export default function DashboardLayout() {
  return (
    <AuthenticationProvider>
      <SystemDataProvider>
        <SmsProvider>
          <Tabs tabBar={(props) => <TabBar {...props} />} />
        </SmsProvider>
      </SystemDataProvider>
    </AuthenticationProvider>
  );
}

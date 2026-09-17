import SystemDataProvider from "@/providers/data-provider.component";
import { Tabs } from "expo-router";
import AuthenticationProvider from "@/providers/authentication-provider.component";
import Lucide from "@react-native-vector-icons/lucide";
import SmsProvider from "@/providers/sms-provider.component";

/**
 * Main layout for dashboard screens
 */
export default function DashboardLayout() {
  const iconSize = 24;
  return (
    <AuthenticationProvider>
      <SystemDataProvider>
        <SmsProvider>
          <Tabs>
            <Tabs.Screen
              name={"index"}
              options={{
                title: "Home",
                tabBarIcon: () => <Lucide name={"home"} size={iconSize} />,
              }}
            />
            <Tabs.Screen
              name={"analysis"}
              options={{
                title: "Analysis",
                tabBarIcon: () => (
                  <Lucide name={"chart-no-axes-column"} size={iconSize} />
                ),
              }}
            />
            <Tabs.Screen
              name={"history"}
              options={{
                title: "Transactions",
                tabBarIcon: () => (
                  <Lucide name={"arrow-left-right"} size={iconSize} />
                ),
              }}
            />
            <Tabs.Screen
              name={"settings"}
              options={{
                title: "Settings",
                tabBarIcon: () => <Lucide name={"settings"} size={iconSize} />,
              }}
            />
          </Tabs>
        </SmsProvider>
      </SystemDataProvider>
    </AuthenticationProvider>
  );
}

import SystemDataProvider from "@/providers/data-provider.component";
import { Tabs } from "expo-router";
import AuthenticationProvider from "@/providers/authentication-provider.component";

/**
 * Main layout for dashboard screens
 */
export default function DashboardLayout() {
  return (
    <AuthenticationProvider>
      <SystemDataProvider>
        <Tabs />
      </SystemDataProvider>
    </AuthenticationProvider>
  );
}

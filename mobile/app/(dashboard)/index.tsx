import { View } from "react-native";
import { useEffect, useState } from "react";
import { client } from "@/lib/client";
import { useData } from "@/providers/data-provider.component";
import { AxiosError } from "axios";
import AddressModal from "@/components/address-modal";
import {
  useAuthentication
} from "@/providers/authentication-provider.component";

/**
 * Component rendering the home tab
 */
export default function Home() {
  const { setData } = useData();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { isAuthenticated } = useAuthentication();

  /**
   * Retrieve data related to importing sms messages
   */
  const loadImportData = async () => {
    if (!isAuthenticated) return;
    try {
      const [timestampResponse, addressResponse] = await Promise.all([
        client.get("/dashboard/last-import"),
        client.get("/address"),
      ]);

      const [timestampData, addressData] = [
        timestampResponse.data,
        addressResponse.data,
      ];

      if (timestampData) {
        console.log(timestampData);
        setData((prev) => ({
          ...prev,
          lastImport: timestampData.timestamp || 0,
        }));
      }

      if (addressData) {
        setData((prev) => ({ ...prev, addresses: addressData }));
      }
    } catch (e) {
      if (e instanceof AxiosError) {
        setShowAddressForm(true);
      } else {
        console.error("An error has occurred while fetching addresses: ", e);
      }
    }
  };
  useEffect(() => {
    loadImportData();
  }, [isAuthenticated]);

  return (
    <View>
      {showAddressForm && (
        <AddressModal
          close={async () => {
            setShowAddressForm(false);
            await loadImportData();
          }}
        />
      )}
    </View>
  );
}

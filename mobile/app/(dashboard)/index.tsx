import { View } from "react-native";
import { useEffect, useState } from "react";
import { client } from "@/lib/client";
import { useData } from "@/providers/data-provider.component";
import { AxiosError } from "axios";
import AddressModal from "@/components/address-modal";
import { useAuthentication } from "@/providers/authentication-provider.component";
import { Address } from "@/lib/dto";

/**
 * Component rendering the home tab
 */
export default function Home() {
  const { setData } = useData();
  const [ showAddressForm, setShowAddressForm ] = useState(false);
  const { isAuthenticated } = useAuthentication();

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await client.get("/address");
      const data = response.data as Address[];

      if (data) {
        setData((prev) => ({ ...prev, addresses: data }));
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
    loadData();
  }, [ isAuthenticated ]);
  return (
    <View>
      {showAddressForm && (
        <AddressModal
          close={async () => {
            setShowAddressForm(false);
            await loadData();
          }}
        />
      )}
    </View>
  );
}

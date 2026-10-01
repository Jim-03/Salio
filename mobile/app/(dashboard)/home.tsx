import { Pressable, ScrollView, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { client } from "@/lib/client";
import { useData } from "@/providers/data-provider.component";
import { AxiosError } from "axios";
import AddressModal from "@/components/address-modal";
import { useAuthentication } from "@/providers/authentication-provider.component";
import Lucide from "@react-native-vector-icons/lucide";
import { Tabs, useRouter } from "expo-router";
import { TransactionRow } from "@/components/transaction-row";
import { useBottomTabBarHeight } from "expo-router/build/react-navigation/bottom-tabs";
import { useSms } from "@/providers/sms-provider.component";
import { HomeData } from "@/lib/dto";
import Header, { NotificationIcon } from "@/components/header";

/**
 * Component rendering the home tab
 */
export default function Home() {
  const { setData } = useData();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { isAuthenticated } = useAuthentication();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [outgoing, setOutgoing] = useState(0);
  const tabHeight = useBottomTabBarHeight();
  const { isUploading } = useSms();

  /**
   * Retrieve data related to importing sms messages
   */
  const loadImportData = async () => {
    if (!isAuthenticated) {
      return;
    }
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

  useEffect(() => {
    const fetchData = async () => {
      // Wait after upload
      if (isUploading) return;
      setIsLoading(true);

      try {
        const response = await client.get("/dashboard/home");
        const data = response.data as HomeData;

        if (data) {
          setBalance(data.balance);
          setIncome(data.income);
          setOutgoing(data.expense);
          setData((prev) => ({
            ...prev,
            transactions: new Set([
              ...prev.transactions,
              ...data.last_5_transactions,
            ]),
          }));
        }
      } catch (e) {
        if (e instanceof AxiosError) {
          console.error(
            "An error has occurred while fetching the home tab's data: ",
            e,
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isUploading]);

  return (
    <ScrollView
      className={"flex-1 p-5 dark:bg-slate-900 bg-amber-50"}
      contentContainerStyle={{ paddingBottom: tabHeight + 80 }}
    >
      <Tabs.Screen
        options={{
          header: () => <Header headerRight={<NotificationIcon />} />,
        }}
      />
      {showAddressForm && (
        <AddressModal
          close={async () => {
            setShowAddressForm(false);
            await loadImportData();
          }}
        />
      )}
      <Banner balance={balance} loading={isLoading} />
      <Expenditure income={income} outgoing={outgoing} loading={isLoading} />
      <Transactions />
    </ScrollView>
  );
}

/**
 * Component displaying the balance
 *
 * @param balance Remaining balance
 * @param loading state variable to check if the app is still loading
 */
const Banner = ({
  balance,
  loading,
}: {
  balance: number;
  loading: boolean;
}) => {
  return (
    <View
      className={
        "w-full bg-green-900 h-1/5 rounded-2xl items-center p-2.5 gap-5 elevation-md"
      }
    >
      <Text className={"text-white/70 font-semibold text-2xl"}>Balance</Text>
      <Text
        numberOfLines={1}
        className={"font-bold text-3xl color-white max-w-[80%]"}
      >
        Ksh. {balance.toLocaleString()}
      </Text>
    </View>
  );
};

const Expenditure = ({
  income,
  outgoing,
  loading,
}: {
  income: number;
  outgoing: number;
  loading: boolean;
}) => {
  const details = [
    {
      name: "Income",
      icon: "banknote-arrow-down",
      amount: income,
    },
    {
      name: "Spent",
      icon: "banknote-arrow-up",
      amount: outgoing,
    },
  ];
  return (
    <View className={"mt-2.5 items-center gap-1"}>
      {/* Title */}
      <Text className={"font-semibold text-xl text-green-950 dark:text-white"}>
        Current Month&#39;s trend
      </Text>

      <View className={"flex-row justify-between w-full"}>
        {/* Income */}
        {details.map((d, k) => {
          const isIncome = d.amount === income;
          const color = isIncome ? "rgb(22, 101, 52)" : "rgb(220, 38, 38)";
          return (
            <View key={k} className={"w-5/12 items-center justify-center h-20"}>
              <Lucide name={d.icon} size={24} color={color} />
              <Text className={"text-xs"} style={{ color }}>
                {d.name}
              </Text>
              <Text
                style={{ color }}
                numberOfLines={1}
                className={"font-semibold"}
              >
                Ksh. {d.amount.toLocaleString()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const Transactions = () => {
  const { data } = useData();
  const [transactions, setTransactions] = useState(
    data.transactions.slice(0, 4),
  );
  const router = useRouter();

  useEffect(() => {
    setTransactions(data.transactions.slice(0, 5));
  }, [data.transactions]);

  return (
    <View className={"flex-1"}>
      {/* Header */}
      <View
        className={
          "flex-row justify-between mt-2.5 items-center border-b border-b-black/15 pb-2.5"
        }
      >
        <Text className={"font-semibold text-green-950 dark:text-white"}>
          Latest Transactions
        </Text>
        <Pressable
          className={"flex-row items-center"}
          onPress={() => router.push("/history")}
        >
          <Text className={"font-semibold text-amber-700"}>See all</Text>
          <Lucide name={"chevron-right"} size={22} color={"rgb(180, 83, 9)"} />
        </Pressable>
      </View>

      {transactions.map((tr, key) => (
        <TransactionRow transaction={tr} key={key} />
      ))}
    </View>
  );
};

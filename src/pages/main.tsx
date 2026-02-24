import { AppState, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavBar from "../components/navBar";
import useAppStyles from "../utils/styles";
import { useEffect, useState } from "react";
import Home from "../screens/home";
import { useSms } from "../services/messages";

/**
 * Main page
 * @returns A component that renders the main screen
 */
const Main = () => {
  const appStyles = useAppStyles();
  const [activeButton, setActiveButton] = useState("Home");
  const { importSms } = useSms();

  useEffect(() => {
    importSms();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: "seagreen" }}>
      <SafeAreaView>
        <View style={[{ alignItems: "center" }, appStyles.screenBackground]}>
          <View style={{ flex: 1, width: "95%", margin: 5 }}>
            {activeButton === "Home" && <Home />}
          </View>
          <NavBar
            activeButton={activeButton}
            setActiveButton={setActiveButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Main;

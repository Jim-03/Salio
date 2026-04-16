import {
  darkModeBackground,
  lightModeBackground,
  primaryColor,
} from "@/constants/colors";
import { useLightTheme } from "@/contexts/theme-provider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React from "react";
import {
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

/**
 * Message component that requests the user to permit the app to read SMS
 *
 * The app's architecture requires sms messages as its backbone data
 * @returns {React.JSX.Element} A message permission screen
 */
export default function Message(): React.JSX.Element {
  const isLight = useLightTheme();
  const styles = StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: isLight ? lightModeBackground : darkModeBackground,
      alignItems: "center",
    },
    smsIcon: {
      fontSize: 30,
      color: primaryColor,
      marginTop: 100,
      marginBottom: 10,
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
      color: primaryColor,
      marginBottom: 10,
    },
    notice: {
      flexShrink: 1,
      textAlign: "center",
      fontSize: 18,
      color: isLight ? "black" : "white",
    },
    requestPermissionButton: {
      marginTop: 20,
      backgroundColor: primaryColor,
      width: 120,
      height: 50,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      elevation: 10,
    },
    requestPermissionText: {
      color: "white",
    },
    infoContainer: {
      marginTop: "auto",
      marginBottom: 10,
      marginHorizontal: 10,
      backgroundColor: "rgba(44, 139, 87, 0.2)",
      paddingHorizontal: 10,
      paddingVertical: 15,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: "darkgreen",
      gap: 10,
    },
  });
  /**
   * Requests READ SMS permission from the user
   * @returns {Promise<void>} A promise that resolves when permission is granted
   * @throws {Error} In case an error occurs while requesting permission
   */
  const grantPermission = async (): Promise<void> => {
    try {
      const grant = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      );
      console.log("Message permission granted: ", grant);
      if (grant === PermissionsAndroid.RESULTS.GRANTED) {
        router.push("/introduction/security");
        // TODO: Import sms immediately
      }
    } catch (e) {
      console.error(
        "An error has occurred while requesting READ SMS permission",
      );
      throw e;
    }
  };
  return (
    <View style={styles.background}>
      {/*SMS icon*/}
      <MaterialIcons name={"message"} style={styles.smsIcon} />

      {/*Title*/}
      <Text style={styles.title}>SMS permission</Text>

      {/*Notice*/}
      <Text style={styles.notice}>
        Salio requires permission to read your M-Pesa transaction messages
      </Text>

      {/*Request permission button*/}
      <TouchableWithoutFeedback onPress={grantPermission}>
        <View style={styles.requestPermissionButton}>
          <MaterialIcons
            name={"handshake"}
            size={24}
            style={styles.requestPermissionText}
          />
          <Text style={{ ...styles.requestPermissionText, fontSize: 18 }}>
            Grant
          </Text>
        </View>
      </TouchableWithoutFeedback>

      {/*Info container*/}
      <View style={styles.infoContainer}>
        <MaterialIcons
          name={"info"}
          size={24}
          color={isLight ? "darkgreen" : "white"}
        />
        <Text
          style={{
            textAlign: "justify",
            color: isLight ? "darkgreen" : "white",
          }}
        >
          Your transactions are stored locally and aren't sent to any server
        </Text>
      </View>
    </View>
  );
}

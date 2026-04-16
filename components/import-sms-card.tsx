import { darkModeContainerColor, lightModeContainerColor, primaryColor } from "@/constants/colors";
import { useLightTheme } from "@/contexts/theme-provider";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

interface ImportSmsCardProps {
  isLoading: boolean;
}

/**
 * Display a card to block user's from using the app during importation
 * @param {boolean} isLoading Boolean variable that determines if the card is visible
 * @returns {React.JSX.Element} A card component to block users
 */
export default function ImportSmsCard({ isLoading }: ImportSmsCardProps): React.JSX.Element {
  const isLight = useLightTheme();

  const bgColor = isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(44, 44, 44, 0.7)';
  const cardColor = isLight ? lightModeContainerColor : darkModeContainerColor;
  const textColor = isLight ? primaryColor : 'white';

  return (
      <Modal
          transparent={true}
          visible={isLoading}
          animationType="fade"
      >
        <View style={[styles.background, { backgroundColor: bgColor }]}>
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <ActivityIndicator color={textColor} size={25} />
            <Text style={[styles.info, { color: textColor }]}>
              Importing new transactions
            </Text>
          </View>
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    height: 150,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  info: {
    fontSize: 18,
    fontWeight: '400',
  },
});
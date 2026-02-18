import { View } from 'react-native';
import { useEffect, useState } from 'react';
import useAppStyles from './src/utils/styles';
import { ThemeProvider, useTheme } from './src/services/theme';
import { AsyncStorage } from 'expo-sqlite/kv-store';
import Registration from './src/services/registration/registration';
import { DatabaseProvider } from './src/services/database';
import MessageProvider from './src/services/messages';

/**
 * The apps main content to be displayed
 */
function MainContent() {
  const [isRegistered, setIsRegistered] = useState(false);
  const styles = useAppStyles();

  /**
   * Hook to check if the app has ever been opened
   */
  useEffect(() => {
    const getRegistration = async () => {
      const data = await AsyncStorage.getItem('isRegistered');
      if (data) setIsRegistered(JSON.parse(data));
    };
    getRegistration();
  }, []);

  return (
    <View style={styles.screenBackground}>
      {!isRegistered && <Registration setIsRegistered={() => setIsRegistered(true)}/>}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <MessageProvider>
          <MainContent/>
        </MessageProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
import { AppState, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import useAppStyles from './src/utils/styles';
import { ThemeProvider } from './src/services/theme';
import { AsyncStorage } from 'expo-sqlite/kv-store';
import Registration from './src/services/registration/registration';
import { DatabaseProvider } from './src/services/database';
import MessageProvider from './src/services/messages';
import Authenticate from './src/pages/authentication';

/**
 * The apps main content to be displayed
 */
function MainContent() {
  const [isRegistered, setIsRegistered] = useState(false);
  const styles = useAppStyles();
  const [isLocked, setIsLocked] = useState(true);
  const timeOut = useRef(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        timeOut.current = Date.now();
      } else if (state === 'active') {
        if (Date.now() - timeOut.current > ( 1000 * 5 )) {
          setIsLocked(true);
        }
      }
    });
    return () => subscription.remove();
  }, []);

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
      {isRegistered && isLocked && <Authenticate setIsLocked={() => setIsLocked(false)}/>}
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
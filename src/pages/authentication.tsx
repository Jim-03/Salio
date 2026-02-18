import { Modal, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import useAppStyles from '../utils/styles';
import { JSX } from 'react';

interface AuthenticateProps {
  setIsLocked: () => void;
}

/**
 * Authenticate
 * @param setIsLocked Function to change the locked state of the app
 * @returns {JSX.Element} A reusable component that locks out the user from using the app
 */
const Authenticate = ({setIsLocked}: AuthenticateProps): JSX.Element => {
  const appStyles = useAppStyles();

  return <Modal>
    <View style={appStyles.screenBackground}>
      <Text style={[appStyles.heading, {marginTop: 50, marginBottom: 'auto'}]}>Salio is locked</Text>
      <MaterialIcons name={'fingerprint'} color={'seagreen'} onPress={async () => {
        const isAuthenticated = await LocalAuthentication.authenticateAsync();
        if (isAuthenticated.success) setIsLocked();
      }} style={{
        marginHorizontal: 'auto',
        marginBottom: 20,
        fontSize: 60
      }}/>
    </View>
  </Modal>;
};

export default Authenticate;
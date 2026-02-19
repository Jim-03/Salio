import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/navBar';
import useAppStyles from '../utils/styles';
import { useState } from 'react';

/**
 * Main page
 * @returns A component that renders the main screen
 */
const Main = () => {
  const appStyles = useAppStyles();
  const [activeButton, setActiveButton] = useState('Home');

  return <View style={{flex: 1, backgroundColor: 'seagreen'}}>
    <SafeAreaView>
      <View style={[{alignItems: 'center'}, appStyles.screenBackground]}>
        <Text>Hello</Text>
        <NavBar activeButton={activeButton} setActiveButton={setActiveButton}/>
      </View>
    </SafeAreaView>
  </View>;
};

export default Main;
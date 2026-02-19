import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useAppStyles from '../utils/styles';
import { useTheme } from '../services/theme';

interface NavBarProps {
  activeButton: string,
  setActiveButton: (value: ( ( (prevState: string) => string )|string )) => void
}

/**
 * Bottom Navigation Bar
 * @param activeButton The current active button
 * @param setActiveButton Function to change the active button
 * @returns A reusable component that renders the navigation bar
 */
const NavBar = ({activeButton, setActiveButton}: NavBarProps) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    navBar: {
      position: 'relative',
      bottom: 0,
      width: '95%',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingVertical: 10,
      marginBottom: 10,
      borderRadius: 10,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      elevation: 3,
      height: 80
    },
    button: {
      width: '20%',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 5,
      borderRadius: 10
    },
    text: {
      color: theme === 'light' ? 'seagreen' : 'white'
    },
    buttonIcon: {
      fontSize: 30
    },
    activeButton: {
      backgroundColor: theme === 'light' ? 'rgb(225, 225, 225)' : 'grey'
    }

  });

  const buttons = [
    {
      name: 'Home',
      icon: <MaterialIcons name="home" style={[styles.text, styles.buttonIcon]}/>,
      action: () => {
        setActiveButton('Home');
      }
    },
    {
      name: 'History',
      icon: <MaterialIcons name="bar-chart" style={[styles.text, styles.buttonIcon]}/>,
      action: () => {
        setActiveButton('History');
      }
    },
    {
      name: 'Review',
      icon: <MaterialIcons name="history" style={[styles.text, styles.buttonIcon]}/>,
      action: () => {
        setActiveButton('Review');
      }
    }, {
      name: 'Settings',
      icon: <MaterialIcons name="settings" style={[styles.text, styles.buttonIcon]}/>,
      action: () => {
        setActiveButton('Settings');
      }
    }
  ];

  const appStyles = useAppStyles();
  return (
    <View style={[appStyles.container, styles.navBar]}>
      {buttons.map((b, k) => <TouchableWithoutFeedback onPress={b.action} key={k}>
        <View style={[styles.button, activeButton === b.name ? styles.activeButton : undefined]}>
          {b.icon}
          <Text style={styles.text}>{b.name}</Text>
        </View>
      </TouchableWithoutFeedback>)}
    </View>
  );
};


export default NavBar;
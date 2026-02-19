import { useTheme } from '../services/theme';
import { DimensionValue } from 'react-native';

/**
 * App's UI styling
 */
const useAppStyles = () => {
  const systemTheme = useTheme();

  return {
    screenBackground: {
      backgroundColor: systemTheme === 'light' ? 'rgb(245, 245, 245)' : 'rgb(0, 0, 0)',
      height: '100%' as DimensionValue,
      gap: 5
    },
    logo: {
      fontSize: 50,
      fontWeight: 'bold' as 'bold',
      color: 'seagreen'
    },
    heading: {
      color: 'seagreen',
      fontSize: 30,
      fontWeight: 'bold' as 'bold',
      alignSelf: 'center' as 'center'
    },
    text: {
      color: systemTheme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
      fontSize: 17
    },
    container: {
      backgroundColor: systemTheme === "light" ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.3)"
    }

  };
};

export default useAppStyles;


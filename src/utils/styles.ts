import { useTheme } from '../services/theme';
import { FlexAlignType } from 'react-native';

/**
 * App's UI styling
 */
const useAppStyles = () => {
  const systemTheme = useTheme();

  return {
    screenBackground: {
      backgroundColor: systemTheme === 'light' ? 'rgb(245, 245, 245)' : 'rgb(0, 0, 0)',
      justifyContent: 'center' as 'center',
      alignItems: 'center' as FlexAlignType,
      flex: 1,
      flexDirection: 'row' as 'row',
      gap: 5
    },
    logo: {
      fontSize: 50,
      fontWeight: 'bold' as 'bold',
      color: 'seagreen'
    }

  };
};

export default useAppStyles;


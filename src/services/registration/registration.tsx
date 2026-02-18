import { JSX, useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import useAppStyles from '../../utils/styles';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

/**
 * Welcome screen
 * @returns {JSX.Element} A reusable component that renders the welcome screen dialog
 */
const Registration = (): JSX.Element => {
  const [view, setView] = useState(1);
  const appStyles = useAppStyles();
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    slideAnim.setValue(300);
    Animated.timing(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 500
    }).start();
  }, [slideAnim]);
  }, [view]);

  let screen: JSX.Element = <></>;

  if (view === 1) screen = <View style={{...appStyles.screenBackground}}>
    <Image source={require('../../../assets/icon.png')} style={styles.registrationIcon}/>
    <Text style={appStyles.heading}>Welcome to Salio!</Text>
    <Text style={{...appStyles.text, paddingLeft: 10}}>An analysis tool for your M-Pesa transactions</Text>
    <View style={styles.featureContainer}>
      <View style={{...appStyles.container, ...styles.feature}}>
        <Text style={appStyles.text}>Trend based categorization</Text>
        <MaterialIcons name="auto-awesome" size={24} style={styles.featureIcon}/>
      </View>
      <View style={{...appStyles.container, ...styles.feature}}>
        <Text style={appStyles.text}>Graphed transactions</Text>
        <MaterialIcons name="auto-graph" size={24} style={styles.featureIcon}/>
      </View>
    </View>
    <NextButton setView={() => setView(2)}/>
  </View>;

  /**
   * TODO
   * Import SMS
   * User authentication
   */
  return <Animated.View style={{flex: 1, transform: [{translateX: slideAnim}]}}>{screen}</Animated.View>;

};

/**
 * Next button
 * @param setView Function triggered when the next button is clicked
 * @returns {JSX.Element} A reusable component that renders the next button
 */
const NextButton = ({setView}: {setView: () => void}): JSX.Element => {
  const buttonStyles = StyleSheet.create({
    button: {
      height: 50,
      flexDirection: 'row',
      backgroundColor: 'seagreen',
      width: '30%',
      borderRadius: 10,
      elevation: 5,
      position: 'absolute',
      bottom: 10,
      right: 10,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10
    },
    text: {
      color: 'white'
    }

  });
  return <TouchableWithoutFeedback onPress={() => setView()}>
    <View style={buttonStyles.button}>
      <Text style={{...buttonStyles.text, fontSize: 20}}>Next</Text>
      <MaterialCommunityIcons name="arrow-right-thick" size={24} style={buttonStyles.text}/>
    </View>
  </TouchableWithoutFeedback>;
};


const styles = StyleSheet.create({
  registrationIcon: {
    width: 150,
    height: 150,
    marginTop: 50,
    marginBottom: 150,
    marginHorizontal: 'auto'
  },
  background: {
    backgroundColor: 'red',
    flex: 1,
    height: '100%'
  },
  featureContainer: {
    width: '80%',
    marginHorizontal: 'auto',
    marginTop: 10,
    gap: 20
  },
  feature: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingLeft: 15,
    gap: 10,
    borderRadius: 5,
    boxShadow: [{offsetY: 3, offsetX: -3, blurRadius: 5, color: 'rgba(0, 0, 0, 0.1)'}]
  },
  featureIcon: {
    position: 'absolute',
    right: 10
  }

});

export default Registration;
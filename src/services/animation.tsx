import { JSX, useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Fontisto } from '@expo/vector-icons';

interface LoadingProps {
  color: string;
}

/**
 * Spinning cog animation
 * @param color The cog's color
 * @returns {JSX.Element} A reusable document that displays a spinning cog animation
 */
export function Loading({color}: LoadingProps): JSX.Element {
  const loadAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(loadAnim, {
        duration: 3000,
        toValue: 1,
        useNativeDriver: true,
        easing: Easing.linear
      })).start();
  }, [loadAnim]);

  const spin = loadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']

  });

  return <View>
    <View style={{
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Animated.View style={{
        transform: [{rotate: spin}],
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Fontisto name={'spinner-cog'} style={{fontSize: 50, color: color}}/>
      </Animated.View>
    </View>
  </View>
    ;
}
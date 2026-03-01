import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React, { useRef } from "react";
import { Animated, View } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps) {
  const ripple = useRef(new Animated.Value(0)).current;
  const handlePressIn = (ev: any) => {
    Animated.timing(ripple, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      ripple.setValue(0);
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    props.onPressIn?.(ev);
  };

  return (
    <PlatformPressable {...props} onPressIn={handlePressIn} style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          style={{
            position: "absolute",
            width: 45,
            height: 45,
            borderRadius: 22,
            backgroundColor: "rgba(0,0,0,0.12)",
            transform: [
              {
                scale: ripple.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 1.3],
                }),
              },
            ],
            opacity: ripple.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.25],
            }),
          }}
        />

        {props.children}
      </View>
    </PlatformPressable>
  );
}

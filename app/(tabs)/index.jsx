import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Button, StyleSheet, TextInput } from 'react-native';
import "../../global.css";
import { Business } from '../components/business.js';

export default function HomeScreen() {
  const [businessName, setBusinessName] = useState('');
//   const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businesses, setBusinesses] = useState([]);

  const SubmitBusiness = () => {

    const newBusiness = new Business(businessName);
    setBusinesses((prevBusinesses) => [...prevBusinesses, newBusiness]);


  }


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">add business!</ThemedText>
      </ThemedView>
      <ThemedView>
        <TextInput
          placeholder='BUSINESS NAME'
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
        />
        <Button
          title="Add Business"
          onPress={SubmitBusiness}
        ></Button>
      </ThemedView>
    </ParallaxScrollView >
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  input: {
    borderColor: "rgb(0, 0, 0)",
    color: "#rgb(255, 255, 255)",
  }
});

import React from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Business } from "@/models/business";
import ProfilePicture from "../components/profilePicture";

const testBusinesses: Business[] = [
  new Business(
    "McDonalds",
    "Fast Food",
    "McDonald's is the world's leading global foodservice retailer with over 40,000 locations in more than 100 countries, serving burgers, fries, chicken, and breakfast items.",
    "https://creativereview.imgix.net/uploads/2020/03/mcds-banner.jpg",
    43.8150,
    -79.4180
  ),
  new Business(
    "Starbucks",
    "Food",
    "[description]",
    "https://creativereview.imgix.net/uploads/2020/03/mcds-banner.jpg",
    43.8120,
    -79.4140
  ),
  new Business(
    "Tim Hortons",
    "Food",
    "[description]",
    "https://creativereview.imgix.net/uploads/2020/03/mcds-banner.jpg",
    43.8135,
    -79.4165
  ),
];

export default function LocalMap() {
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 43.8110,
          longitude: -79.4130,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {testBusinesses.map((business, index) => (
          <Marker
            key={index}
            coordinate={business.getCoordinate()}
            title={business.getName()}
            description={business.getCategory()}
          />
        ))}
      </MapView>
      <Text
        style={{
          position: "absolute",
          top: 20,
          left: 18,
          fontSize: 34,
          fontWeight: "bold",
          padding: 6,
          borderRadius: 6,
        }}
      >
        Map
      </Text>
      <View
        style={{
          position: "absolute",
          top: 20,
          right: 18,
        }}
      >
        <ProfilePicture />
      </View>
    </View>
  );
}

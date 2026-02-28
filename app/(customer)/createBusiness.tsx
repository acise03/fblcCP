import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function CreateBusiness() {
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<
    "food" | "retail" | "services" | "misc"
  >("misc");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryOptions = ["food", "retail", "services", "misc"] as const;
  const createBusiness = useBusinessStore((state) => state.createBusiness);
  const updateBusinessInfo = useBusinessStore(
    (state) => state.updateBusinessInfo,
  );
  const updateBusinessAddress = useBusinessStore(
    (state) => state.updateBusinessAddress,
  );
  const refreshBusiness = useAuthStore((state) => state.refreshOwnedBusiness);
  const loading = useAuthStore((state) => state.loading);
  const userId = useAuthStore((state) => state.user!!.id);
  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidPhone = (value: string) => /^\+?[0-9().\-\s]{7,20}$/.test(value);
  const isValidWebsite = (value: string) =>
    /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(value);
  const error = useBusinessStore((state) => state.error);
  if (loading) return null;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="h-screen w-screen"
    >
      <View className="h-full w-full bg-[#FFF8F0]">
        <View className="mx-8 mt-8 flex flex-1 flex-col bg-[#FFF8F0] justify-center">
          <Text className="text-4xl font-extrabold text-[#2B1E1B] mb-2 text-center">
            Create A Business
          </Text>
          <View className=" mt-4 flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
            <TextInput
              onChangeText={setBusinessName}
              value={businessName}
              className="text-lg"
              placeholder="Business Name"
            />
          </View>
          <View className=" mt-1 flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4 h-100">
            <GooglePlacesAutocomplete
              placeholder="Address"
              fetchDetails={true}
              onPress={(data, details = null) => {
                console.log(data);
                setAddress(details?.formatted_address!!);
                setPlaceId(data.place_id);
              }}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                language: "en",
              }}
              keepResultsAfterBlur={true}
              debounce={300}
            />
          </View>
          <View className=" mt-1 flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
            <TextInput
              onChangeText={setDescription}
              value={description}
              placeholder="Description"
            />
          </View>
          <View className=" mt-1 flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
            <TextInput
              onChangeText={setEmail}
              value={email}
              placeholder="Email"
              inputMode="email"
            />
          </View>
          <View className=" mt-1 flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
            <TextInput
              onChangeText={setPhone}
              value={phone}
              placeholder="Phone"
              inputMode="tel"
            />
          </View>
          <View className=" mt-1 flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
            <TextInput
              onChangeText={setWebsite}
              value={website}
              placeholder="Website"
              inputMode="url"
            />
          </View>

          <Pressable
            onPress={() => setCategoryMenuOpen((prev) => !prev)}
            className="border border-gray-300 rounded-md px-3 py-3 mb-2"
          >
            <Text className="text-black">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </Pressable>

          {categoryMenuOpen && (
            <View className="border border-black-300 rounded-md mb-2">
              {categoryOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    setCategory(option);
                    setCategoryMenuOpen(false);
                  }}
                  className="px-3 py-3 border-b border-gray-200 last:border-b-0"
                >
                  <Text className="text-black">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            className="mt-2 bg-[#E8B24E] rounded-xl py-4 items-center mb-6"
            onPress={async () => {
              const b = businessName.trim();
              const d = description.trim();
              const e = email.trim().toLowerCase();
              const p = phone.trim();
              const w = website.trim();
              console.log("business create pressed");

              if (!b) return;
              if (e && !isValidEmail(e)) return;
              if (p && !isValidPhone(p)) return;
              if (w && !isValidWebsite(w)) return;

              if (!placeId) return;
              console.log("guards passed");

              await createBusiness(b, userId, category).then((business) => {
                updateBusinessAddress(business.id, placeId).then((res) => {
                  updateBusinessInfo(business.id, {
                    description: d,
                    email: e,
                    phone: p,
                    website: w,
                  });
                });
              });

              refreshBusiness();
              if (!error) router.replace("/(business)");
            }}
          >
            <Text className="font-semibold text-base">Create Business</Text>
          </Pressable>

          <Text>Error text: {error}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

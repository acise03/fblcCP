import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import "../../global.css";
import ImageUploadItem from "../components/imageUploadItem";
import ProfilePicture from "../components/profilePicture";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type HoursEntry = {
  day: number;
  open_time: string;
  close_time: string;
  is_closed: number;
};

const DEFAULT_HOURS: HoursEntry[] = DAY_NAMES.map((_, i) => ({
  day: i,
  open_time: "09:00",
  close_time: "17:00",
  is_closed: 1,
}));

let dummyImages = [
  { id: "1", uri: "https://reactnative.dev/img/tiny_logo.png" },
  { id: "2", uri: "https://reactnative.dev/img/tiny_logo.png" },
  { id: "add", uri: "hi" },
];

type EditableInfoField =
  | "description"
  | "address"
  | "phone"
  | "email"
  | "website";

const fieldLabels: Record<EditableInfoField, string> = {
  description: "About Us",
  address: "Address",
  phone: "Phone Number",
  email: "Email",
  website: "Website",
};

const fieldPlaceholders: Record<EditableInfoField, string> = {
  description: "Business description",
  address: "Business address",
  phone: "Phone number",
  email: "Email",
  website: "Website URL",
};

type Category = "food" | "retail" | "services" | "misc";

const toCategory = (value: unknown): Category => {
  if (
    value === "food" ||
    value === "retail" ||
    value === "services" ||
    value === "misc"
  ) {
    return value;
  }
  return "misc";
};

const getFormattedAddressFromPlaceId = async (
  placeId: string,
): Promise<string | null> => {
  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
      placeId,
    )}?fields=formattedAddress&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (res.ok) {
      return json?.formattedAddress ?? null;
    }

    console.log("Places v1 error:", json);
    ToastAndroid.show("Places error", ToastAndroid.SHORT);
    return null;
  } catch (err) {
    ToastAndroid.show("Failed to fetch address", ToastAndroid.SHORT);
    return null;
  }
};

export default function BusinessAbout() {
  const setMode = useModalSettingsStore((state) => state.setMode);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryOptions: readonly Category[] = [
    "food",
    "retail",
    "services",
    "misc",
  ];
  const [category, setCategory] = useState<Category>("misc");
  const updateBusiness = useBusinessStore((state) => state.updateBusiness);
  const uploadBusinessBanner = useBusinessStore(
    (state) => state.uploadBusinessBanner,
  );
  const uploadBusinessProfilePicture = useBusinessStore(
    (state) => state.uploadBusinessProfilePicture,
  );
  const updateBusinessAddress = useBusinessStore(
    (state) => state.updateBusinessAddress,
  );
  const updateBusinessHours = useBusinessStore(
    (state) => state.updateBusinessHours,
  );
  const updateBusinessInfo = useBusinessStore(
    (state) => state.updateBusinessInfo,
  );
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const refreshBusiness = useAuthStore((state) => state.refreshOwnedBusiness);
  const [savedAddress, setSavedAddress] = useState("");
  const [hours, setHours] = useState<HoursEntry[]>(DEFAULT_HOURS);
  const [editingHours, setEditingHours] = useState(false);

  useFocusEffect(() => {
    setMode("business");
    return () => {};
  });

  if (dummyImages.length % 2 !== 0) {
    dummyImages = [...dummyImages, { id: "empty", uri: "" }];
  }

  const [editingField, setEditingField] = useState<EditableInfoField | null>(
    null,
  );
  const [draftValues, setDraftValues] = useState<
    Record<EditableInfoField, string>
  >({
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<EditableInfoField, string>>
  >({});

  useEffect(() => {
    const hydrate = async () => {
      const placeIdFromDb = ownedBusiness?.business_addresses?.address ?? "";

      const resolvedAddress = placeIdFromDb
        ? ((await getFormattedAddressFromPlaceId(placeIdFromDb)) ?? "")
        : "";

      setSavedAddress(resolvedAddress);

      setDraftValues({
        description: ownedBusiness?.business_information?.description ?? "",
        address: resolvedAddress,
        phone: ownedBusiness?.business_information?.phone ?? "",
        email: ownedBusiness?.business_information?.email ?? "",
        website: ownedBusiness?.business_information?.website ?? "",
      });

      setCategory(toCategory(ownedBusiness?.category));
    };

    void hydrate();
  }, [ownedBusiness]);

  useEffect(() => {
    if (
      ownedBusiness?.business_hours &&
      ownedBusiness.business_hours.length > 0
    ) {
      const merged = DAY_NAMES.map((_, i) => {
        const existing = ownedBusiness.business_hours?.find((h) => h.day === i);
        return existing
          ? {
              day: existing.day,
              open_time: existing.open_time ?? "09:00",
              close_time: existing.close_time ?? "17:00",
              is_closed: existing.is_closed,
            }
          : DEFAULT_HOURS[i];
      });
      setHours(merged);
    }
  }, [ownedBusiness]);

  const validateField = (
    field: EditableInfoField,
    value: string,
  ): string | null => {
    const v = value.trim();

    if (v.length === 0) return null;

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(v)) return "Invalid email format.";
    }

    if (field === "phone") {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        return "Phone number must be 7-15 digits.";
      }
    }

    if (field === "website") {
      const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`;
      try {
        const url = new URL(candidate);
        if (!url.hostname || !url.hostname.includes(".")) {
          return "Invalid website URL.";
        }
      } catch {
        return "Invalid website URL.";
      }
    }

    return null;
  };

  const startEditing = (field: EditableInfoField) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setEditingField(field);
  };

  const saveField = async (field: EditableInfoField) => {
    if (!ownedBusiness) return;

    const nextValue = (draftValues[field] ?? "").trim();
    const error = validateField(field, nextValue);

    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
      return;
    }

    if (field === "address") {
      if (!placeId) {
        setDraftValues((prev) => ({ ...prev, address: savedAddress }));
        setEditingField(null);
        ToastAndroid.show(
          "Pick an address from suggestions.",
          ToastAndroid.SHORT,
        );
        return;
      }
      await updateBusinessAddress(ownedBusiness.id, placeId!!);
      setSavedAddress(draftValues.address.trim());
    } else {
      await updateBusinessInfo(ownedBusiness.id, {
        [field]: nextValue,
      } as Partial<
        Record<"description" | "phone" | "email" | "website", string>
      >);
    }

    setEditingField(null);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    await refreshBusiness();
  };

  return (
    <ScrollView className="h-full w-full bg-[#FFF8F0]">
      <View className="mx-8 mt-8 flex flex-col bg-[#FFF8F0]">
        <View className="flex flex-row items-center justify-between">
          <Text className="font-bold text-4xl text-black">Configuration</Text>
          <ProfilePicture />
        </View>
        <View className="relative w-full h-48 mt-8">
          <Image
            className="bg-gray-500 w-full h-full rounded-3xl"
            source={
              ownedBusiness?.business_information?.banner
                ? { uri: ownedBusiness.business_information.banner }
                : { uri: "" }
            }
          />
          {editingName ? (
            <View
              style={{
                position: "absolute",
                bottom: 44,
                left: 16,
                right: 100,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="New business name"
                style={{
                  backgroundColor: "white",
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  flex: 1,
                }}
              />
              <Pressable
                onPress={async () => {
                  if (newName.trim().length > 1) {
                    await updateBusiness(ownedBusiness!!.id, {
                      name: newName.trim(),
                    });
                  }
                  refreshBusiness();
                  setEditingName(false);
                }}
              >
                <Text style={{ marginLeft: 8 }}>Save</Text>
              </Pressable>
              <Pressable onPress={() => setEditingName(false)}>
                <Text style={{ marginLeft: 8 }}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <Text className="bottom-11 left-4 text-white font-bold text-2xl">
              {ownedBusiness?.name}
            </Text>
          )}
          <Pressable
            className="absolute top-4 right-2"
            onPress={() => setDropdownVisible((prev) => !prev)}
          >
            <Entypo name="dots-three-vertical" size={24} color="white" />
            {dropdownVisible && (
              <View
                style={{
                  position: "absolute",
                  top: 28,
                  right: 0,
                  backgroundColor: "white",
                  borderRadius: 8,
                  elevation: 4,
                  padding: 8,
                  zIndex: 10,
                  width: 150,
                }}
              >
                <Pressable
                  onPress={async () => {
                    setDropdownVisible(false);
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ["images"],
                      allowsEditing: true,
                    });

                    if (
                      result.canceled ||
                      !result.assets?.length ||
                      !ownedBusiness
                    ) {
                      ToastAndroid.show("No image chosen", ToastAndroid.SHORT);
                      return;
                    }
                    uploadBusinessBanner(
                      ownedBusiness!!.id,
                      result.assets[0].uri,
                    ).then(async (newUri) => {
                      updateBusinessInfo(ownedBusiness.id, { banner: newUri });
                      refreshBusiness();
                    });
                  }}
                >
                  <Text>Upload Banner</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    setDropdownVisible(false);
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ["images"],
                      allowsEditing: true,
                      aspect: [1, 1],
                    });

                    if (
                      result.canceled ||
                      !result.assets?.length ||
                      !ownedBusiness
                    ) {
                      ToastAndroid.show("No image chosen", ToastAndroid.SHORT);
                      return;
                    }
                    uploadBusinessProfilePicture(
                      ownedBusiness.id,
                      result.assets[0].uri,
                    ).then(async () => {
                      refreshBusiness();
                      ToastAndroid.show(
                        "Profile picture updated",
                        ToastAndroid.SHORT,
                      );
                    });
                  }}
                >
                  <Text>Upload Profile Picture</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setEditingName(true);
                    setNewName(ownedBusiness!!.name);
                    setDropdownVisible(false);
                  }}
                >
                  <Text>Change Name</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </View>

        <View className="flex flex-col mt-6">
          <Text className="text-zinc-700 font-semibold text-2xl">
            Information
          </Text>

          <View className="flex flex-col mt-6">
            {(
              [
                "description",
                "address",
                "phone",
                "email",
                "website",
              ] as EditableInfoField[]
            ).map((field) => {
              const isEditing = editingField === field;
              const currentValue =
                field === "address"
                  ? (draftValues.address ?? "")
                  : ((ownedBusiness?.business_information?.[field] ??
                      "") as string);
              const isMultiline = field === "description";

              return (
                <View key={field} className="mb-5">
                  <View className="flex flex-row items-center justify-between">
                    <Text className=" text-zinc-700 font-semibold text-xl">
                      {fieldLabels[field]}
                    </Text>
                    <Pressable onPress={() => startEditing(field)}>
                      <Feather name="edit-3" size={22} color="black" />
                    </Pressable>
                  </View>

                  {isEditing ? (
                    <View style={{ flexDirection: "column", marginTop: 8 }}>
                      {field === "address" ? (
                        <GooglePlacesAutocomplete
                          placeholder="Address"
                          fetchDetails={true}
                          keepResultsAfterBlur={true}
                          onPress={(data, details = null) => {
                            console.log(data);
                            setDraftValues((prev) => ({
                              ...prev,
                              address: details?.formatted_address!!,
                            }));
                            setPlaceId(data.place_id);
                          }}
                          debounce={250}
                          enablePoweredByContainer={false}
                          query={{
                            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                            language: "en",
                          }}
                          textInputProps={{
                            value: draftValues.address,
                            onChangeText: (text: string) => {
                              setDraftValues((prev) => ({
                                ...prev,
                                address: text,
                              }));
                              setPlaceId(null);
                            },
                          }}
                          styles={{
                            container: { flex: 0 },
                            listView: {
                              zIndex: 60,
                              elevation: 8,
                              backgroundColor: "white",
                            },
                          }}
                        />
                      ) : (
                        <View className="flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
                          <TextInput
                            value={draftValues[field]}
                            onChangeText={(text) =>
                              setDraftValues((prev) => ({
                                ...prev,
                                [field]: text,
                              }))
                            }
                            placeholder={fieldPlaceholders[field]}
                            style={{
                              backgroundColor: "white",

                              textAlignVertical: isMultiline ? "top" : "center",
                            }}
                            multiline={isMultiline}
                            autoCapitalize={
                              field === "email" || field === "website"
                                ? "none"
                                : "sentences"
                            }
                            keyboardType={
                              field === "email"
                                ? "email-address"
                                : field === "phone"
                                  ? "phone-pad"
                                  : "default"
                            }
                          />
                        </View>
                      )}
                      {fieldErrors[field] ? (
                        <Text style={{ color: "#dc2626", marginTop: 6 }}>
                          {fieldErrors[field]}
                        </Text>
                      ) : null}
                      <View style={{ flexDirection: "row", marginTop: 8 }}>
                        <Pressable onPress={() => saveField(field)}>
                          <Text style={{ marginRight: 12 }}>Save</Text>
                        </Pressable>
                        <Pressable onPress={() => setEditingField(null)}>
                          <Text>Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Text className=" text-zinc-700 text-xl text-lg mt-1">
                      {currentValue.trim().length > 0
                        ? currentValue
                        : "Not provided"}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
          <View className="flex flex-col mb-4">
            <Text className="mb-2 text-xl font-semibold">Category</Text>
            <Pressable
              onPress={() => setCategoryMenuOpen((prev) => !prev)}
              className="border border-gray-300 rounded-md px-3 py-3 mb-2"
            >
              <Text className="text-black">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </Pressable>

            {categoryMenuOpen && (
              <View className="border border-gray-300 rounded-md mb-2">
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
              onPress={() =>
                updateBusiness(ownedBusiness!!.id, { category: category })
              }
            >
              <Text> Save</Text>
            </Pressable>
          </View>

          <View className="flex flex-col">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-zinc-700 font-semibold text-xl mb-2">
                Working Hours
              </Text>
              <Pressable onPress={() => setEditingHours((prev) => !prev)}>
                <Feather name="edit-3" size={22} color="black" />
              </Pressable>
            </View>

            <View className="border border-zinc-300 rounded-xl overflow-hidden">
              {hours
                .sort((a, b) => {
                  const order = [6, 0, 1, 2, 3, 4, 5];
                  return order.indexOf(a.day) - order.indexOf(b.day);
                })
                .map((item, index) => (
                  <View
                    key={item.day}
                    className={`flex flex-row justify-between items-center px-4 py-3 ${
                      index !== 6 ? "border-b border-zinc-200" : ""
                    }`}
                  >
                    <Text className="text-zinc-700 text-base font-medium">
                      {DAY_NAMES[item.day]}
                    </Text>

                    {editingHours ? (
                      <View className="flex-row items-center">
                        <Pressable
                          onPress={() => {
                            setHours((prev) =>
                              prev.map((h) =>
                                h.day === item.day
                                  ? {
                                      ...h,
                                      is_closed: h.is_closed === 1 ? 0 : 1,
                                    }
                                  : h,
                              ),
                            );
                          }}
                          className={`px-2 py-1 rounded mr-2 ${
                            item.is_closed === 1 ? "bg-red-200" : "bg-green-200"
                          }`}
                        >
                          <Text className="text-xs">
                            {item.is_closed === 1 ? "Closed" : "Open"}
                          </Text>
                        </Pressable>

                        {item.is_closed === 0 && (
                          <View className="flex-row items-center">
                            <TextInput
                              value={item.open_time}
                              onChangeText={(text) =>
                                setHours((prev) =>
                                  prev.map((h) =>
                                    h.day === item.day
                                      ? { ...h, open_time: text }
                                      : h,
                                  ),
                                )
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-16 text-center text-sm"
                              placeholder="09:00"
                            />
                            <Text className="mx-1">-</Text>
                            <TextInput
                              value={item.close_time}
                              onChangeText={(text) =>
                                setHours((prev) =>
                                  prev.map((h) =>
                                    h.day === item.day
                                      ? { ...h, close_time: text }
                                      : h,
                                  ),
                                )
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-16 text-center text-sm"
                              placeholder="17:00"
                            />
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text className="text-zinc-500 text-base">
                        {item.is_closed === 1
                          ? "Closed"
                          : `${item.open_time} - ${item.close_time}`}
                      </Text>
                    )}
                  </View>
                ))}
            </View>

            {editingHours && (
              <View className="flex-row mt-2 mb-4">
                <Pressable
                  className="bg-[#FFB627] rounded-xl px-4 py-2 mr-2"
                  onPress={async () => {
                    if (!ownedBusiness) return;
                    try {
                      await updateBusinessHours(ownedBusiness.id, hours);
                      setEditingHours(false);
                      ToastAndroid.show("Hours saved", ToastAndroid.SHORT);
                      refreshBusiness();
                    } catch {
                      ToastAndroid.show(
                        "Failed to save hours",
                        ToastAndroid.SHORT,
                      );
                    }
                  }}
                >
                  <Text className="font-semibold">Save</Text>
                </Pressable>
                <Pressable
                  className="bg-gray-200 rounded-xl px-4 py-2"
                  onPress={() => {
                    if (
                      ownedBusiness?.business_hours &&
                      ownedBusiness.business_hours.length > 0
                    ) {
                      const merged = DAY_NAMES.map((_, i) => {
                        const existing = ownedBusiness.business_hours?.find(
                          (h) => h.day === i,
                        );
                        return existing
                          ? {
                              day: existing.day,
                              open_time: existing.open_time ?? "09:00",
                              close_time: existing.close_time ?? "17:00",
                              is_closed: existing.is_closed,
                            }
                          : DEFAULT_HOURS[i];
                      });
                      setHours(merged);
                    } else {
                      setHours([...DEFAULT_HOURS]);
                    }
                    setEditingHours(false);
                  }}
                >
                  <Text>Cancel</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
        <View className="flex flex-col mt-6">
          <Text className=" text-zinc-700 font-semibold text-xl">
            Upload Pictures
          </Text>
          <FlatList
            className="my-2"
            data={dummyImages}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <ImageUploadItem id={item.id} uri={item.uri} />
            )}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

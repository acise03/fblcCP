import { Image, Text, View } from "react-native";
import "../../global.css";

type PollItemProps = {
  text: string;
  date: Date;
  votes: Record<string, number>;
  comments: string[];
};

export default function PollItem({
  text,
  date,
  votes,
  comments,
}: PollItemProps) {
  return (
    <View className="p-4 flex flex-col rounded-2xl bg-[#FFE4A3] w-full">
      <View className="flex flex-row items-center">
        <Image className="rounded-full w-14 h-14 bg-gray-500" />
        <View className="px-4 flex flex-col flex-1">
          <Text className="text-md font-medium" style={{ fontFamily: "Rubik" }}>
            {text}
          </Text>
          <Text
            className="text-sm text-gray-500"
            style={{ fontFamily: "Rubik" }}
          >
            {date.toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text className="text-md mt-2" style={{ fontFamily: "Rubik" }}>
        Most recent two comments
      </Text>
      <Text className="text-md" style={{ fontFamily: "Rubik" }}>
        will go here
      </Text>
      <View className="flex flex-row justify-end flex-wrap">
        <Text>Pending vote results: </Text>
        {Object.entries(votes).map(([option, count]) => (
          <View key={option} className="px-1 flex flex-row items-center">
            <Text className="text-md mr-2" style={{ fontFamily: "Rubik" }}>
              {count}
            </Text>
            <Text className="text-md" style={{ fontFamily: "Rubik" }}>
              {option}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

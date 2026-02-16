import { Business } from "@/models/business";
import { Event } from "@/models/event";
import { Review } from "@/models/review";
import React, { useMemo, useState } from "react";

import {
  ScrollView,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

const testBusiness = new Business(
  "McDonalds",
  "Fast Food",
  "McDonald's is the world's leading global foodservice retailer with over 40,000 locations in more than 100 countries, serving burgers, fries, chicken, and breakfast items.",
  "https://creativereview.imgix.net/uploads/2020/03/mcds-banner.jpg",
  43.8150,
  -79.4180

); // fix this later to make it not test

const testreview1 = new Review(
  4,
  "Food was served hot and the service was quick despite the staff shortage",
  new Date(),
  "Johnny",
);

const testreview2 = new Review(
  3,
  "I was waiting in the hour drivethru for about 10 minutes which wasn't the worst thing.  I ordered a fillet of fish combo with a strawberry milkshake.  What seemed like an eternity later I got to the window and was told they didn't have strawberry...  So I I said what do you have? They said chocolate and vanilla...  Fair enough I chose Villa although they could have told me that earlier.  I received my food and checked to ensure it was correct and realized my fries were about half full...  Probably a mistake but left a sour taste since I had waited so long for the food and they didn't even have e everything I ordered.  I took a picture and showed my friends and it wasnt an exaggeration by any means as they all reacted as I did.  Please see picture posted.  I rate this experience a 1 star and think they can at least apologize for the wait when someone comes to the window...  Especially went you can't fulfill the order.  Thanks",
  new Date(),
  "Tommy",
);

const testreview3 = new Review(
  1,
  "They make the drive through customer wait for way too long, 20+mins",
  new Date(),
  "Bobby",
);

testBusiness.addReview(testreview1);
testBusiness.addReview(testreview2);
testBusiness.addReview(testreview3);

const testevent1 = new Event(
  "Family Day Sale",
  "Purchase our Happy Meal and Big Mac Combo for just $15.99",
  new Date(),
  new Date(),
);

const testevent2 = new Event(
  "Sunday Morning Sale",
  "All menu items 5% off.",
  new Date(),
  new Date(),
);
testBusiness.addEvent(testevent1);
testBusiness.addEvent(testevent2);

const events = testBusiness.getEvents();

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};
import { DateData } from "react-native-calendars";

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const selectedDayEvents = events.filter(
    (event) => formatDate(event.getStart()) === selectedDate
  );

  const markedDates = useMemo(() => {
    const marks: any = {};

    events.forEach((event, index) => {
      const dateKey = formatDate(event.getStart());

      if (!marks[dateKey]) {
        marks[dateKey] = { dots: [] };
      }

      marks[dateKey].dots.push({
        key: `event-${index}`,
        color: "#555555",
      });
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: "#555555",
      };
    }

    return marks;
  }, [selectedDate]);

  return (
  <ScrollView >
    <Calendar
      markingType="multi-dot"
      markedDates={markedDates}
      onDayPress={(day: DateData) => {
        setSelectedDate(day.dateString);
        setSelectedEvent(null); 
      }}
    />

    {(
      <View  >
        <Text style={{ color: "black", fontWeight: "bold"}}>
          Events on {selectedDate}
        </Text>

        {selectedDayEvents.length === 0 ? (
          <Text style={{ color: "black" }}>No events.</Text>
        ) : (
          selectedDayEvents.map((event, index) => (
            <Text
              style={{color: "black"}}
              key={index}
              onPress={() => setSelectedEvent(event)}
            >
             - {event.getName()}: {event.getDescription()}
            </Text>
          ))
        )}
      </View>
    )}

     {selectedEvent && (
      <View >
        <Text >
          {selectedEvent.getName()}
        </Text>
        <Text>
          {selectedEvent.getDescription()}
        </Text>
      </View>
    )}
  </ScrollView>
);
}
 
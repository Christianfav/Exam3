import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { GardenProvider } from "./context/GardenContext";

import HomeScreen       from "./screens/HomeScreen";
import MyGardenScreen   from "./screens/MyGardenScreen";
import AIAssistantScreen from "./screens/AIAssistantScreen";
import ScheduleScreen   from "./screens/ScheduleScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home:        ["home",          "home-outline"],
  "My Garden": ["leaf",          "leaf-outline"],
  "AI Helper": ["chatbubble-ellipses", "chatbubble-ellipses-outline"],
  Schedule:    ["calendar",      "calendar-outline"],
};

export default function App() {
  return (
    <GardenProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: "#4A7C59",
            tabBarInactiveTintColor: "#f9fafa",
            tabBarStyle: {
              backgroundColor: "#424f40",
              borderTopColor: "#E5E7EB",
              paddingBottom: 6,
              paddingTop: 6,
              height: 62,
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
            tabBarIcon: ({ focused, color, size }) => {
              const [active, inactive] = TAB_ICONS[route.name] || ["help", "help-outline"];
              return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home"         component={HomeScreen} />
          <Tab.Screen name="My Garden"    component={MyGardenScreen} />
          <Tab.Screen name="AI Helper"    component={AIAssistantScreen} />
          <Tab.Screen name="Schedule"     component={ScheduleScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </GardenProvider>
  );
}
// src/navigation/StackLayout.jsx
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { signOut } from 'firebase/auth';
import React from "react";
import { Alert } from 'react-native';
import { auth } from "../../config/firebase";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import AnalyticsScreen from "./AnalyticsScreen";
import MusicScreen from "./MusicScreen";
import PomodoroScreen from "./PomodoroScreen";
import TasksScreen from "./TasksScreen";
import LoginRegister from './index';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Bottom Tab Navigator Component
const BottomTabs = () => {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Pomodoro") {
            iconName = focused ? "timer" : "timer-outline";
          } else if (route.name === "Tasks") {    
            iconName = focused ? "checkmark-circle" : "checkmark-circle-outline";
          } else if (route.name === "Music") {
            iconName = focused ? "musical-notes" : "musical-notes-outline";
          } else if (route.name === "Analytics") {
            iconName = focused ? "analytics" : "analytics-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Pomodoro" component={PomodoroScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: "Tasks" }} />
      <Tab.Screen
        name="Music"
        component={MusicScreen}
        options={{ title: "Music" }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: "Analytics" }}
      />
    </Tab.Navigator>
  );
};

// Drawer Navigator Component
const DrawerNavigator = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("LoginRegister");
      })
      .catch((err) => {
        console.error("Logout Error:", err);
        Alert.alert("Error", "Failed to logout. Please try again.");
      });
  };

  return (
    <Drawer.Navigator initialRouteName="MainTabs">
      <Drawer.Screen name="MainTabs" component={BottomTabs} options={{ title: 'Home' }} />
      
      <Drawer.Screen
        name="Logout"
        component={BottomTabs}
        options={{
          title: 'Logout',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      />
    </Drawer.Navigator>
  );
};

// Stack Navigator Component
export default function StackLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      }}
    >
    <Stack.Screen name="LoginRegister" component={LoginRegister} />
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}
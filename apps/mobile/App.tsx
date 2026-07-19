import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import type { RootStackParamList } from "@/navigation/types";
import { MyTicketsScreen } from "@/screens/MyTicketsScreen";
import { SubmitTicketScreen } from "@/screens/SubmitTicketScreen";
import { TicketDetailScreen } from "@/screens/TicketDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="MyTickets"
        screenOptions={{
          headerTintColor: "#0aa8d6",
          headerTitleStyle: { color: "#0f172a" },
        }}
      >
        <Stack.Screen
          name="MyTickets"
          component={MyTicketsScreen}
          options={{ title: "My Tickets" }}
        />
        <Stack.Screen
          name="SubmitTicket"
          component={SubmitTicketScreen}
          options={{ title: "Submit a Ticket" }}
        />
        <Stack.Screen
          name="TicketDetail"
          component={TicketDetailScreen}
          options={{ title: "Ticket Details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

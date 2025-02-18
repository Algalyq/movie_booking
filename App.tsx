import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from './src/navigators/TabNavigator';
import MovieDetailsScreen from './src/screens/MovieDetailsScreen';
import SeatBookingScreen from './src/screens/SeatBookingScreen';
import SearchScreen from './src/screens/SearchScreen';
import CinemaScreen from './src/screens/CinemaScreen';
import MyTicketsScreen from './src/screens/MyTickets';
import TicketScreen from './src/screens/TicketScreen';
import SuccessScreen from './src/screens/SuccessScreen';
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="Tab"
          component={TabNavigator}
          options={{animation: 'default'}}
        />
        <Stack.Screen
          name="Screen"
          component={SearchScreen}
          options={{animation: 'default'}}
        />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{animation: 'slide_from_right'}}
        />
        <Stack.Screen
          name="SeatBooking"
          component={SeatBookingScreen}
          options={{animation: 'slide_from_bottom'}}
        />
        <Stack.Screen
          name="CinemaScreen"
          component={CinemaScreen}
          options={{animation: 'default'}}
        />
        <Stack.Screen
          name="MyTicketsScreen"
          component={MyTicketsScreen}
          options={{animation: 'default'}}
        />
        <Stack.Screen
          name="TicketScreen"
          component={TicketScreen}
          options={{animation: 'default'}}
        />
        <Stack.Screen
          name="SuccessScreen"
          component={SuccessScreen}
          options={{animation: 'slide_from_bottom'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

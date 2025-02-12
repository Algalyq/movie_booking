import React, {useState} from 'react';
import { Dimensions } from 'react-native';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  ToastAndroid,
  SafeAreaView,
  Image
} from 'react-native';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../components/AppHeader';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
const timeArray: string[] = [
  '10:30',
  '12:30',
  '14:30',
  '15:00',
  '19:30',
  '21:00',
];

const { width, height } = Dimensions.get('window');

const generateDate = () => {
  const date = new Date();
  let weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let weekdays = [];
  for (let i = 0; i < 7; i++) {
    let tempDate = {
      date: new Date(date.getTime() + i * 24 * 60 * 60 * 1000).getDate(),
      day: weekday[new Date(date.getTime() + i * 24 * 60 * 60 * 1000).getDay()],
    };
    weekdays.push(tempDate);
  }
  return weekdays;
};

const generateSeats = () => {
  const numRows = 5; 
  const numColumns = 7; 
  let seatNumber = 1;
  let seatLayout = [];

  for (let i = 0; i < numRows; i++) {
    let rowArray = [];
    for (let j = 0; j < numColumns; j++) {
      rowArray.push({
        number: seatNumber,
        taken: Boolean(Math.round(Math.random())),
        selected: false,
      });
      seatNumber++;
    }
    seatLayout.push(rowArray);
  }
  return seatLayout;
};


const SeatBookingScreen = ({navigation, route}: any) => {

  const getDayName = (dateString: string): string => {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateString);
    return weekdays[date.getDay()];
  };


  const getDateNumber = (dateString: string): string => {
    const date = new Date(dateString);
    return String(date.getDate()).padStart(2, "0"); // Ensure 2-digit format
  };

  const [dateArray, setDateArray] = useState<any[]>(generateDate());
  

  const [selectedDateIndex, setSelectedDateIndex] = useState({
    fullDate: route.params.date,
    day: getDayName(route.params.date),
    date: getDateNumber(route.params.date),
  });
  const [price, setPrice] = useState<number>(0);
  const [twoDSeatArray, setTwoDSeatArray] = useState<any[][]>(generateSeats());
  const [selectedSeatArray, setSelectedSeatArray] = useState([]);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(route.params.time);;
  const [ticketImage, setTicketImage] = useState(route.params.PosterImage);
  const [cinema, setCinema] = useState(route.params.Cinema);
  const [hall, setHall] = useState(route.params.Hall);
  const [language, setLanguage] = useState(route.params.Language);
  const [prices, setPrices] = useState(route.params.Prices);


  const selectSeat = (index: number, subindex: number, num: number) => {
    if (!twoDSeatArray[index][subindex].taken) {
      let array: any = [...selectedSeatArray];
      let temp = [...twoDSeatArray];
      temp[index][subindex].selected = !temp[index][subindex].selected;
      if (!array.includes(num)) {
        array.push(num);
        setSelectedSeatArray(array);
      } else {
        const tempindex = array.indexOf(num);
        if (tempindex > -1) {
          array.splice(tempindex, 1);
          setSelectedSeatArray(array);
        }
      }
      setPrice(array.length * 1200.0);
      setTwoDSeatArray(temp);
    }
  };

  const BookSeats = async () => {
    if (
      selectedSeatArray.length !== 0 
    ) {
      try {
        await SecureStore.setItemAsync(
          'ticket',
          JSON.stringify({
            seatArray: selectedSeatArray,
            time: selectedTimeIndex,
            date: selectedDateIndex,
            ticketImage: ticketImage,
          })
        );
      } catch (error) {
        console.error(
          'Something went Wrong while storing in BookSeats Functions',
          error,
        );
      }
      navigation.navigate('TicketScreen', {
        seatArray: selectedSeatArray,
        time: selectedTimeIndex,
        date: selectedDateIndex,
        ticketImage: ticketImage,
      });
    } else {
      ToastAndroid.showWithGravity(
        'Please Select Seats, Date and Time of the Show',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    }
  };

  return (
  <SafeAreaView style={styles.container}>
    <ScrollView
      style={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}>
      <StatusBar hidden />
      <View>
    <ImageBackground
          source={{uri: route.params?.BgImage}}
          style={styles.ImageBG}>
          <LinearGradient
            colors={[COLORS.BlackRGB10, COLORS.Black]}
            style={styles.linearGradient}>
            <View style={styles.appHeaderContainer}>
              <AppHeader
                name="arrow-back"
                header={''}
                action={() => navigation.goBack()}
              />
            </View>
          </LinearGradient>
          <Text style={styles.screenText}>Screen this way</Text>
        </ImageBackground> 
      </View>

      <View style={styles.seatContainer}>
        <View style={styles.containerGap20}>        
        {twoDSeatArray?.map((item, index) => {
            return (
              <View key={index} style={styles.seatRow}>
                <View>
                  <Text style={styles.screenText}>{index + 1}</Text>
                </View>
                {item?.map((subitem, subindex) => {
                  return (
                    <TouchableOpacity
                      key={subitem.number}
                      onPress={() => {
                        selectSeat(index, subindex, subitem.number);
                      }}>
                      <MaterialIcons
                        name="event-seat"
                        style={[
                          styles.seatIcon,
                          subitem.taken ? {color: COLORS.Grey} : {},
                          subitem.selected ? {color: COLORS.Orange} : {},
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </View>
        <View style={styles.seatRadioContainer}>
          <View style={styles.radioContainer}>
            <Ionicons name="radio-button-on" style={styles.radioIcon} />
            <Text style={styles.radioText}>Available</Text>
          </View>
          <View style={styles.radioContainer}>
            <Ionicons
              name="radio-button-on"
              style={[styles.radioIcon, {color: COLORS.Grey}]}
            />
            <Text style={styles.radioText}>Taken</Text>
          </View>
          <View style={styles.radioContainer}>
            <Ionicons
              name="radio-button-on"
              style={[styles.radioIcon, {color: COLORS.Orange}]}
            />
            <Text style={styles.radioText}>Selected</Text>
          </View>
        </View>
      </View>

    

      <View style={styles.buttonPriceContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalPriceText}>Total Price</Text>
          <Text style={styles.price}>₸ {price}.00</Text>
        </View>
        <TouchableOpacity onPress={BookSeats}>
          <Text style={styles.buttonText}>Buy Tickets</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black', 
  },
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  header: {
    height: 200,
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20, 
  },
  ImageBG: {
    width: '100%',
    aspectRatio: 3072 / 1727,
  },
  linearGradient: {
    height: '100%',
  },
  screenText: {
    textAlign: 'center',
    fontFamily: FONTFAMILY.poppins_thin,
    fontSize: FONTSIZE.size_12,
    color: COLORS.White,
  },
  containerCur: {
    width: width * 1,
    height: height * 0.08,
    borderRadius: 12,
    backgroundColor: COLORS.Orange,
  },
  curvedLine: {
    width: "20%",
    height: 90,
    position: "absolute",
    bottom: -25,
    left: "40%",
    borderRadius: 24,
    backgroundColor: "black",
    transform: [{ scaleX: 5 }, { scaleY: 1 }],
  },
  banner: { height: 200, width: '100%' },
  gradient: { flex: 1 },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_20 * 2,
  },

  seatContainer: {
    marginVertical: SPACING.space_36,
  },
  containerGap20: {
    gap: SPACING.space_20,
  },
  seatRow: {
    flexDirection: 'row',
    gap: SPACING.space_20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatIcon: {
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  seatRadioContainer: {
    flexDirection: 'row',
    marginTop: SPACING.space_36,
    marginBottom: SPACING.space_10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: SPACING.space_10,
    alignItems: 'center',
  },
  radioIcon: {
    fontSize: FONTSIZE.size_20,
    color: COLORS.White,
  },
  radioText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_12,
    color: COLORS.White,
  },
  containerGap24: {
    gap: SPACING.space_24,
  },
  dateContainer: {
    width: SPACING.space_10 * 7,
    height: SPACING.space_10 * 10,
    borderRadius: SPACING.space_10 * 10,
    backgroundColor: COLORS.DarkGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  dayText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.White,
  },
  OutterContainer: {
    marginVertical: SPACING.space_24,
  },
  timeContainer: {
    paddingVertical: SPACING.space_10,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA50,
    paddingHorizontal: SPACING.space_20,
    borderRadius: BORDERRADIUS.radius_25,
    backgroundColor: COLORS.DarkGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  buttonPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.space_24,
    paddingBottom: SPACING.space_24,
  },
  priceContainer: {
    alignItems: 'center',
  },
  totalPriceText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.Grey,
  },
  price: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  buttonText: {
    borderRadius: BORDERRADIUS.radius_25,
    paddingHorizontal: SPACING.space_24,
    paddingVertical: SPACING.space_10,
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.White,
    backgroundColor: COLORS.Orange,
  },
});

export default SeatBookingScreen;

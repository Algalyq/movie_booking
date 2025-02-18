import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity,StatusBar,Modal,ImageBackground, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BORDERRADIUS, COLORS, FONTFAMILY, FONTSIZE, SPACING } from "../theme/theme";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "../components/AppHeader";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import DashedLine from 'react-native-dashed-line';
import axios from "axios";
import { baseImagePath } from "../api/apicalls";

interface Ticket {
    id: number;
    title: string;
    location: string;
    date: string;
    dateDetails?: { date: number; day: string }; 
    time: string;
    age: string;
    image: string;
    active: boolean;
    seatArray: string[];
}

const getDayOfWeek = (dateString: string) => {
  const dateObject = new Date(dateString); // Directly parse YYYY-MM-DD format
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  return {
      date: dateObject.getDate(),
      day: daysOfWeek[dateObject.getDay()],
  };
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":"); 
  return `${hours}:${minutes}`;
};

  const TicketScreen = ({navigation, route}: any) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [session, setSession] = useState<any>(null);
    useEffect(() => {
      if (route.params?.seatArray) {
          const newTicket = {
              id: tickets.length + 1,
              title: route.params.title || "Movie Ticket", 
              location: route.params.cinema || "Cinema",
              date: `${route.params.date.date}.${route.params.date.fullDate.split('-')[1]}.${route.params.date.fullDate.split('-')[0]}`,
              time: route.params.time,
              age: "", 
              image: route.params.ticketImage,
              active: true,
              seatArray: route.params.seatArray
          };
          setTickets(prevTickets => [newTicket, ...prevTickets]);
      }
  }, [route.params]);


useEffect(() => {
  const fetchTickets = async () => {
      const token = '2fb2309ecdfa0619a4f9baa59dc4936dd68d230d';
      try {
          const response = await axios.get("http://localhost:8001/api/bookings/", {
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token}`
              }
          });

          if (response.data.results.length > 0) {
              const sessionId = response.data.results[0].session; // Get session ID
              const sessionResponse = await axios.get(`http://localhost:8001/api/sessions/${sessionId}/`, {
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'Authorization': `Bearer ${token}`
                  }
              });

              const sessionData = sessionResponse.data; 
              console.log(sessionData);
              const fetchedTickets = response.data.results.map((ticket: any) => ({
                  id: ticket.id,
                  title: sessionData.film.title,
                  location: sessionData.theater.location,  
                  date: sessionData.date,  
                  time: sessionData.time,
                  age: "", 
                  image: baseImagePath('w185', sessionData.film.poster) || sessionData.film.poster,
                  active: ticket.is_active,
                  seatArray: ticket.seats || [], 
              }));

              setTickets(fetchedTickets);
          }

      } catch (error) {
          console.error("Error fetching tickets:", error);
      }
    };
  fetchTickets();
}, []);


const renderTicket = ({ item }: { item: Ticket }) => {
        const dayOfWeek = getDayOfWeek(item.date); 
        const formattedTime = formatTime(item.time);
        return (
        <TouchableOpacity style={styles.ticketContainer_one} onPress={() => {
          setSelectedTicket({ 
            ...item,
            time: formattedTime, 
            dateDetails: dayOfWeek 
          });
            setModalVisible(true);
        }}>
          <Image source={{ uri: item.image }} style={styles.ticketImage} />
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketTitle}>{item.title}</Text>
            <Text style={styles.ticketDetails}>{item.location}</Text>
            <Text style={styles.ticketDetails}>
              {item.date} • {formattedTime}
            </Text>
           
          </View>
          <Text style={styles.ageTag}>{item.age}</Text>
        </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
                <StatusBar hidden />
                <View style={styles.appHeaderContainer}>
                  <AppHeader
                    name="arrow-back"
                    header={'My Tickets'}
                    action={() => navigation.goBack()}
                    />
                </View>
            <FlatList
                data={tickets}
                renderItem={renderTicket}
                contentContainerStyle={styles.ticketContainerList}
                keyExtractor={(item) => item.id.toString()}
            />
        <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.ticketContainer}>
        <ImageBackground
          source={{uri: selectedTicket?.image}}
          style={styles.ticketBGImage}>
            {selectedTicket?.active === true ? <>
            <LinearGradient
            colors={[COLORS.OrangeRGBA0, COLORS.Orange]}
            style={styles.linearGradient}>
           
          </LinearGradient>
            </> : <>
            <LinearGradient
            colors={[COLORS.GreyRGBA0, COLORS.Grey]}
            style={styles.linearGradient}>
          </LinearGradient></>}

        </ImageBackground>

    <DashedLine style={selectedTicket?.active === true ? styles.dashedLine : styles.inactiveDashedLine} dashLength={10} dashThickness={4} dashStyle={{ borderRadius: 12 }} dashColor={selectedTicket?.active === true ? COLORS.Orange : COLORS.Grey}   dashGap={14}/>

        <View style={selectedTicket?.active === true ? styles.ticketFooter : styles.inactiveTicketFooter}>
          <View style={styles.ticketDateContainer}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.dateTitle}>{selectedTicket?.dateDetails?.date}</Text>
              <Text style={styles.subtitle}>{selectedTicket?.dateDetails?.day}</Text>
            </View>
            <View style={styles.subtitleContainer}>
              <Ionicons name="time-sharp" style={styles.clockIcon} />
              <Text style={styles.subtitle}>{selectedTicket?.time}</Text>
            </View>
          </View>
          <View style={styles.ticketSeatContainer}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subheading}>Hall</Text>
              <Text style={styles.subtitle}>02</Text>
            </View>
            {selectedTicket?.seatArray && (
              <View style={styles.subtitleContainer}>
                <Text style={styles.subheading}>Row</Text>
                <Text style={styles.subtitle}>
                  {Object.keys(selectedTicket.seatArray).join(", ")}
                </Text>
              </View>
            )}
            {selectedTicket?.seatArray && (
              <View style={styles.subtitleContainer}>
                <Text style={styles.subheading}>Seats</Text>
                <Text style={styles.subtitle}>
                  {Object.values(selectedTicket.seatArray).join(", ")}
                </Text>
              </View>
            )}

          </View>
          <Image
            source={require('../assets/image/barcode.png')}
            style={styles.barcodeImage}
          />
        </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}>
            <Ionicons name="close-circle" size={56} color={COLORS.White} />
        </TouchableOpacity>
        </View>
        
        </Modal>

        </SafeAreaView>

    );

  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    ticketContainerList: { padding: 16,gap: 8 },
    ticketContainer_one: { flexDirection: "row", padding: 16, backgroundColor: "#1A1A1A",borderRadius: BORDERRADIUS.radius_15, },
    ticketImage: { width: 64, height: 84, borderRadius: 4 },
    ticketInfo: { flex: 1, marginLeft: 10 },
    ticketTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.Orange },
    ticketDetails: { fontSize: 14, color: COLORS.White },
    ticketTag: {
      backgroundColor: COLORS.Orange,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 12,
      fontWeight: "bold",
      color: "#fff",
      alignSelf: "flex-start",
      marginTop: 4,
    },
    ageTag: {
      fontSize: 14,
      color: COLORS.White,
      fontWeight: "bold",
    },  
    tabContainer: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc" },
    tab: { flex: 1, padding: 10, alignItems: "center" },
    activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.Orange },
    tabText: { fontSize: 14, color: "#555" },
    activeTabText: { color: COLORS.Orange },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
    emptyImage: { width: 80, height: 80, marginBottom: 16 },
    emptyTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: COLORS.Orange },
    emptySubtitle: { fontSize: 12, textAlign: "center", color: COLORS.White },
    appHeaderContainer: { marginHorizontal: SPACING.space_16,marginTop: SPACING.space_10,},
    ticketContainer: {
        flex: 1,
        justifyContent: 'center',
        top: -20,
      },
      ticketBGImage: {
        alignSelf: 'center',
        width: 280,
        aspectRatio: 200 / 300,
        borderTopLeftRadius: BORDERRADIUS.radius_25,
        borderTopRightRadius: BORDERRADIUS.radius_25,
        overflow: 'hidden',
        justifyContent: 'flex-end',
      },
      linearGradient: {
        height: '50%',
      },
      linear: {
        borderRadius: 23,
        borderWidth: 2.4, 
        width: 280,
        alignSelf: 'center',
        backgroundColor: COLORS.Orange,
        borderStyle: 'dashed',
      },
      inactiveLinear: {
        borderWidth: 2.4, 
        width: 280,
        alignSelf: 'center',
        backgroundColor: COLORS.Grey,
        borderStyle: 'dashed',
        
      },
      inactiveTicketFooter: {
        backgroundColor: COLORS.Grey,
        width: 280,
        alignItems: 'center',
        paddingBottom: SPACING.space_36,
        alignSelf: 'center',
        borderBottomLeftRadius: BORDERRADIUS.radius_25,
        borderBottomRightRadius: BORDERRADIUS.radius_25,
      },
      ticketFooter: {
        backgroundColor: COLORS.Orange,
        width: 280,
        alignItems: 'center',
        paddingBottom: SPACING.space_36,
        alignSelf: 'center',
        borderBottomLeftRadius: BORDERRADIUS.radius_25,
        borderBottomRightRadius: BORDERRADIUS.radius_25,
      },
      dashedLine: {
        width: 270,
        alignSelf: "center",
      },
      
      inactiveDashedLine: {
        width: 270,
        alignSelf: "center",
      },
      
      ticketDateContainer: {
        flexDirection: 'row',
        gap: SPACING.space_36,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: SPACING.space_10,
      },
      ticketSeatContainer: {
        flexDirection: 'row',
        gap: SPACING.space_36,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: SPACING.space_10,
      },
      dateTitle: {
        fontFamily: FONTFAMILY.poppins_medium,
        fontSize: FONTSIZE.size_24,
        color: COLORS.White,
      },
      subtitle: {
        fontFamily: FONTFAMILY.poppins_regular,
        fontSize: FONTSIZE.size_14,
        color: COLORS.White,
      },
      subheading: {
        fontFamily: FONTFAMILY.poppins_medium,
        fontSize: FONTSIZE.size_18,
        color: COLORS.White,
      },
      subtitleContainer: {
        alignItems: 'center',
      },
      clockIcon: {
        fontSize: FONTSIZE.size_24,
        color: COLORS.White,
        paddingBottom: SPACING.space_10,
      },
      barcodeImage: {
        height: 50,
        aspectRatio: 158 / 52,
      },
      blackCircle: {
        height: 80,
        width: 80,
        borderRadius: 80,
        backgroundColor: COLORS.Black,
        overflow: "hidden", 
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContent: {
        width: '90%',
        backgroundColor: COLORS.Black,
        borderRadius: BORDERRADIUS.radius_15,
        alignItems: 'center',
        padding: SPACING.space_20,
      },
      modalTitle: {
        color: COLORS.White,
        fontSize: FONTSIZE.size_20,
        fontFamily: FONTFAMILY.poppins_bold,
      },
      modalTitleInactive: {
        color: COLORS.Grey,
        fontSize: FONTSIZE.size_20,
        textAlign: 'center',
        padding: SPACING.space_10,
      },
      modalDetails: {
        padding: SPACING.space_20,
      },
      modalText: {
        color: COLORS.White,
        fontSize: FONTSIZE.size_16,
        marginBottom: SPACING.space_10,
      },
      closeButton: {
        position: 'absolute',
        zIndex: 1,
      },
    
  });

  export default TicketScreen;
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity,StatusBar,Modal,ImageBackground, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BORDERRADIUS, COLORS, FONTFAMILY, FONTSIZE, SPACING } from "../theme/theme";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "../components/AppHeader";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import DashedLine from 'react-native-dashed-line';
const tickets = [
    {
      id: 1,
      title: "Qazaq alemi",
      location: "Kinopark 7 Keruencity",
      date: "22.01.2025",
      time: "21:10",
      age: "6+",
      image: "https://cdn.test.vlife.kz/push-notification/FiMMJecYkMVX",
      active: true
    },
    {
      id: 2,
      title: "Крейвен-охотник",
      location: "Kinopark 5 Atakent",
      date: "12.12.2024",
      time: "21:00",
      age: "18+",
      image: "https://example.com/kraven.jpg",
      tag: "Возврат",
      active: false
    },
    {
      id: 3,
      title: "Sheker. Последний шанс",
      location: "Kino Forum",
      date: "23.11.2024",
      time: "20:55",
      age: "18+",
      image: "https://example.com/sheker.jpg",
      active: false
    },
    {
      id: 4,
      title: "Заманбақ",
      location: "Kinopark 5 Atakent",
      date: "09.11.2024",
      time: "22:10",
      age: "",
      image: "https://example.com/zaman.jpg",
      active: false
    },
  ];

  const getDayOfWeek = (dateString: string) => {

    const dateParts = dateString.split("."); 
    const dateObject = new Date(
      parseInt(dateParts[2], 10), 
      parseInt(dateParts[1], 10) - 1, 
      parseInt(dateParts[0], 10) 
    );
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysOfWeek[dateObject.getDay()];
    const date = dateObject.getDate();
    return {
      date: date, 
      day: dayOfWeek, 
    };
  };

  const TicketScreen = ({navigation, route}: any) => {
    const [activeTab, setActiveTab] = useState("active");
    // const navigation = useNavigation<any>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const renderTicket = ({ item }: any) => {
        const dayOfWeek = getDayOfWeek(item.date); // Calculate the day of the week
        return (
        <TouchableOpacity style={styles.ticketContainer_one} onPress={() => {
            setSelectedTicket({ 
                seatArray: route.params.seatArray,
                time: route.params.time,
                date: route.params.date,
                ticketImage: route.params.PosterImage,
                active: item.active });
            setModalVisible(true);
        }}>
          <Image source={{ uri: item.image }} style={styles.ticketImage} />
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketTitle}>{item.title}</Text>
            <Text style={styles.ticketDetails}>{item.location}</Text>
            <Text style={styles.ticketDetails}>
              {item.date} • {item.time}
            </Text>
            {item.tag && <Text style={styles.ticketTag}>{item.tag}</Text>}
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
          source={{uri: selectedTicket?.ticketImage}}
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
              <Text style={styles.dateTitle}>{selectedTicket?.date.date}</Text>
              <Text style={styles.subtitle}>{selectedTicket?.date.day}</Text>
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
            <View style={styles.subtitleContainer}>
              <Text style={styles.subheading}>Row</Text>
              <Text style={styles.subtitle}>04</Text>
            </View>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subheading}>Seats</Text>
              <Text style={styles.subtitle}>
                {selectedTicket?.seatArray
                  .slice(0, 3)
                  .map((item: any, index: number, arr: any) => {
                    return item + (index == arr.length - 1 ? '' : ', ');
                  })}
              </Text>
            </View>
          </View>
          <Image
            source={require('../assets/image/barcode.png')}
            style={styles.barcodeImage}
          />
        </View>
        </View>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close-circle" size={48} color={COLORS.White} />
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
    ticketImage: { width: 50, height: 70, borderRadius: 4 },
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
      }, modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContent: {
        width: '90%',
        backgroundColor: COLORS.Black,
        borderRadius: BORDERRADIUS.radius_15,
        overflow: 'hidden',
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
        top: SPACING.space_36,
        left: SPACING.space_36,
        
      },
    
  });

  export default TicketScreen;
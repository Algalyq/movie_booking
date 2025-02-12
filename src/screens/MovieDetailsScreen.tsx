import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import RaffleTicket from '../components/Ticket';
import AppHeader from '../components/AppHeader';
import CategoryHeader from '../components/CategoryHeader';
import CastCard from '../components/CastCard';

import {COLORS, SPACING, FONTSIZE, FONTFAMILY, BORDERRADIUS} from '../theme/theme';
import {baseImagePath, movieCastDetails, movieDetails} from '../api/apicalls';

interface Screening {
  time: string;
  cinema: string;
  hall: string;
  language: string;
  prices: number[];
}

const getMovieDetails = async (movieid: number) => {
  try {
    let response = await fetch(movieDetails(movieid));
    let json = await response.json();
    return json;
  } catch (error) {
    console.error('Something Went wrong in getMoviesDetails Function', error);
  }
};

const getMovieCastDetails = async (movieid: number) => {
  try {
    let response = await fetch(movieCastDetails(movieid));
    let json = await response.json();
    return json;
  } catch (error) {
    console.error(
      'Something Went wrong in getMovieCastDetails Function',
      error,
    );
  }
};

const screeningsData: { [key: string]: Screening[] } = {
  // Mock data mapped to specific dates
  "2025-02-12": [
    {
      time: "14:05",
      cinema: "Chaplin MEGA Alma-Ata",
      hall: "Зал 13",
      language: "РУС",
      prices: [2900, 1700, 1900],
    },
    {
      time: "14:20",
      cinema: "Kinopark 4 Globus",
      hall: "Зал 2",
      language: "РУС",
      prices: [1700, 1000, 1300],
    },
    {
      time: "14:05",
      cinema: "Chaplin MEGA Alma-Ata",
      hall: "Зал 13",
      language: "РУС",
      prices: [2900, 1700, 1900],
    },
    {
      time: "14:20",
      cinema: "Kinopark 4 Globus",
      hall: "Зал 2",
      language: "РУС",
      prices: [1700, 1000, 1300],
    },
  ],
  "2025-02-13": [
    {
      time: "14:30",
      cinema: "Kinopark 5 Premium Forum",
      hall: "Зал 3 Comfort – 3 этаж",
      language: "РУС",
      prices: [2600, 1600, 2100],
    },
    {
      time: "16:30",
      cinema: "Kinopark 5 Premium Forum",
      hall: "Зал 3 Comfort",
      language: "РУС",
      prices: [2600, 1600, 2100],
    },
  ],
};

const MovieDetailsScreen = ({navigation, route}: any) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);
  const [selectedScreening, setSelectedScreening] = useState<{
    date: string;
    time: string;
    cinema: string;
  } | null>(null);
  const getNext7Days = (): { day: string; date: string }[] => {
    const days = [];
    const weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);

      days.push({
        day: weekdays[nextDate.getDay()],
        date: nextDate.toISOString().split("T")[0],
      });
    }

    return days;
  };

  const dates = getNext7Days();
  const screenings: Screening[] = screeningsData[selectedDate] || [];
  const [movieData, setMovieData] = useState<any>(undefined);
  const [movieCastData, setmovieCastData] = useState<any>(undefined);

  useEffect(() => {
    (async () => {
      const tempMovieData = await getMovieDetails(route.params.movieid);
      setMovieData(tempMovieData);
    })();

    (async () => {
      const tempMovieCastData = await getMovieCastDetails(route.params.movieid);
      setmovieCastData(tempMovieCastData.cast);
    })();
  }, []);

  const renderCastList = () => {
    return movieCastData?.map((item: any, index: number) => (
      <CastCard
        key={item.id}
        shouldMarginatedAtEnd={true}
        cardWidth={80}
        isFirst={index == 0}
        isLast={index == movieCastData?.length - 1}
        imagePath={baseImagePath('w185', item.profile_path)}
        title={item.original_name}
        subtitle={item.character}
      />
    ));
  };

  const handleScreeningPress = (screening: Screening) => {
    setSelectedScreening({
      date: selectedDate,
      time: screening.time,
      cinema: screening.cinema,
    });
    console.log("Selected Screening:", {
      date: selectedDate,
      time: screening.time,
      cinema: screening.cinema,
    });
  };

  const renderScreenings = () => {
    
    return screenings.map((item, index) => (
      <TouchableOpacity 
        key={`${item.time}-${index}`} 
        style={styles.screeningItem} 
        onPress={() => { 
          handleScreeningPress(item),
          navigation.push('SeatBooking', {
            BgImage: baseImagePath('w780', movieData.backdrop_path),
            PosterImage: baseImagePath('original', movieData.poster_path),
            date: selectedDate,
            time: item.time,
            cinema: item.cinema,
            hall: item.hall,
            language: item.language,
            prices: item.prices
          });

        }}
      >
        <View style={styles.timeContainerCinema}>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.cinema}>{item.cinema}</Text>
          <Text style={styles.hall}>{item.hall}</Text>
          <Text style={styles.language}>{item.language}</Text>
          <Text style={styles.prices}>ВЗР: {item.prices[0]} ₸ ДЕТ: {item.prices[1]} ₸ СТУД: {item.prices[2]} ₸</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  if (!movieData || !movieCastData) {
    return (
      <View style={styles.container}>
        <View style={styles.appHeaderContainer}>
          <AppHeader
            name="arrow-back"
            header={''}
            action={() => navigation.goBack()}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={COLORS.Orange} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar hidden />

      <View>
        <ImageBackground
          source={{
            uri: baseImagePath('w780', movieData?.backdrop_path),
          }}
          style={styles.imageBG}>
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
        </ImageBackground>
        <View style={styles.imageBG}></View>
        <Image
          source={{uri: baseImagePath('w342', movieData?.poster_path)}}
          style={styles.cardImage}
        />
      </View>

      <View style={styles.timeContainer}>
        <Ionicons name="time-sharp" style={styles.clockIcon} />
        <Text style={styles.runtimeText}>
          {Math.floor(movieData?.runtime / 60)}h{' '}
          {Math.floor(movieData?.runtime % 60)}m
        </Text>
      </View>

      <View>
        <Text style={styles.title}>{movieData?.original_title}</Text>
        <View style={styles.genreContainer}>
          {movieData?.genres.map((item: any) => {
            return (
              <View style={styles.genreBox} key={item.id}>
                <Text style={styles.genreText}>{item.name}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.tagline}>{movieData?.tagline}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.rateContainer}>
          <Ionicons name="star" style={styles.starIcon} />
          <Text style={styles.runtimeText}>
            {movieData?.vote_average.toFixed(1)} ({movieData?.vote_count})
          </Text>
          <Text style={styles.runtimeText}>
            {movieData?.release_date.substring(8, 10)}{' '}
            {new Date(movieData?.release_date).toLocaleString('default', {
              month: 'long',
            })}{' '}
            {movieData?.release_date.substring(0, 4)}
          </Text>
        </View>
        <Text style={styles.descriptionText}>{movieData?.overview}</Text>
      </View>

      <View>
        <CategoryHeader title="Top Cast" />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.castScrollContainer}
        >
          {renderCastList()}
        </ScrollView>
      </View>

      <View style={styles.list_container}>
        <View style={styles.list_cinema}>
          <Text style={styles.monthText}>
            {today.toLocaleString("default", { month: "long" }).toUpperCase()}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.dateContainer}
          >
            {dates.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDate(item.date)}
                style={[styles.dateButton, selectedDate === item.date && styles.selectedDate]}
              >
                <Text style={styles.dateText}>{item.day}</Text>
                <Text style={styles.dateText}>{parseInt(item.date.split("-")[2], 10)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {screenings.length > 0 ? (

          <View>{renderScreenings()}</View>
        ) : (
          <Text style={styles.emptyText}>No screenings available for this date.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  scrollViewContent: {
    paddingBottom: SPACING.space_20,
  },
  loadingContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_20 * 2,
  },
  imageBG: {
    width: '100%',
    aspectRatio: 3072 / 1727,
  },
  linearGradient: {
    height: '100%',
  },
  cardImage: {
    width: '60%',
    aspectRatio: 200 / 300,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  clockIcon: {
    fontSize: FONTSIZE.size_20,
    color: COLORS.WhiteRGBA50,
    marginRight: SPACING.space_8,
  },
  timeContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.space_15,
  },
  timeContainerCinema: {
    justifyContent: 'center',
  },
  runtimeText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  title: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
    marginHorizontal: SPACING.space_36,
    marginVertical: SPACING.space_15,
    textAlign: 'center',
  },
  genreContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.space_20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  genreBox: {
    borderColor: COLORS.WhiteRGBA50,
    borderWidth: 1,
    paddingHorizontal: SPACING.space_10,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDERRADIUS.radius_25,
  },
  genreText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_10,
    color: COLORS.WhiteRGBA75,
  },
  tagline: {
    fontFamily: FONTFAMILY.poppins_thin,
    fontSize: FONTSIZE.size_14,
    fontStyle: 'italic',
    color: COLORS.White,
    marginHorizontal: SPACING.space_36,
    marginVertical: SPACING.space_15,
    textAlign: 'center',
  },
  infoContainer: {
    marginHorizontal: SPACING.space_24,
  },
  rateContainer: {
    flexDirection: 'row',
    gap: SPACING.space_10,
    alignItems: 'center',
  },
  starIcon: {
    fontSize: FONTSIZE.size_20,
    color: COLORS.Yellow,
  },
  descriptionText: {
    fontFamily: FONTFAMILY.poppins_light,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  castScrollContainer: {
    gap: SPACING.space_24,
  },
  list_cinema: {
    marginVertical: SPACING.space_10,
  },
  list_container: {
    marginHorizontal: SPACING.space_24,
    marginVertical: SPACING.space_10,
  },
  monthText: {
    fontSize: FONTSIZE.size_18,
    fontWeight: 'bold',
    color: COLORS.White,
  },
  dateContainer: {
    marginTop: 8,
    flexDirection: "row",
  },
  dateButton: {
    padding: 12,
    alignItems: "center",
    marginRight: 8,
  },
  selectedDate: {
    backgroundColor: COLORS.Orange,
    borderRadius: 8,
  },
  dateText: {
    color: "#fff",
    fontSize: 14,
  },
  screeningItem: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: COLORS.White,
    marginVertical: 8,
    padding: 8,
    borderRadius: 8,
    justifyContent:"center",
    gap: 12
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.Orange,
  },
  details: {
  },
  cinema: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  hall: {
    fontSize: 14,
    color: "#555",
  },
  language: {
    fontSize: 12,
    color: "#999",
  },
  prices: {
    fontSize: 14,
    color: "#333",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    color: "#999",
  },
});

export default MovieDetailsScreen;

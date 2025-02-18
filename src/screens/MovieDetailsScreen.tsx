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

const transformMovieData = (json: any) => {
  return {
    title: json.title,
    overview: json.overview,
    release_date: json.release_date,
    runtime: json.runtime,
    tagline: json.tagline,
    genres: json.genres.slice(0, 2), // Get only the first two genres
    poster_path: json.poster_path,
  };
};
let idMovie = 1;
const getMovieDetails = async (movieid: number) => {
  try {
    let response = await fetch(movieDetails(movieid));
    let json = await response.json();
    // Transform data
    let transformedData = transformMovieData(json);
    console.log(json.id);
    // Send POST request
    let postResponse = await fetch("http://localhost:8001/api/films/import_film/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedData),
    });

    if (!postResponse.ok) {
      throw new Error("Failed to import film");
    }

    let result = await postResponse.json();
    idMovie = result.id;
    console.log("Film imported successfully:", result);
    // return result;
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

const fetchScreenings = async (filmId: number) => {
  const url = `http://localhost:8001/api/sessions/${filmId}/sessions_by_film_and_date/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Token 2fb2309ecdfa0619a4f9baa59dc4936dd68d230d",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data: { [key: string]: any[] } = await response.json();

    const screeningsData: { [key: string]: Screening[] } = {};

    for (const [date, sessions] of Object.entries(data)) {
      screeningsData[date] = sessions.map((session) => ({
        time: session.time,
        cinema: session.cinema,
        hall: session.hall,
        language: session.language,
        prices: session.prices,
      }));
    }

    return screeningsData;
  } catch (error) {
    console.error("Failed to fetch screenings:", error);
    return {};
  }
};

const MovieDetailsScreen = ({navigation, route}: any) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);
  const [screeningsData, setScreeningsData] = useState<{ [key: string]: Screening[] }>({});
  
  const [selectedScreening, setSelectedScreening] = useState<{
    date: string;
    time: string;
    cinema: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchScreenings(idMovie); 
      setScreeningsData(data);
      if (data[selectedDate] && data[selectedDate].length > 0) {
        setSelectedScreening({
          date: selectedDate,
          time: data[selectedDate][0].time,
          cinema: data[selectedDate][0].cinema,
        });
      }
    };

    fetchData();
  }, [selectedDate]); 

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
            title: movieData.title,
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

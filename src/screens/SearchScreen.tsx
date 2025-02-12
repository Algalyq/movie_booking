import React, {useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import {COLORS, SPACING} from '../theme/theme';
import {baseImagePath, searchMovies} from '../api/apicalls';
import InputHeader from '../components/InputHeader';
import SubMovieCard from '../components/SubMovieCard';

const {width, height} = Dimensions.get('screen');

const SearchScreen = ({navigation}: any) => {
  const [searchList, setSearchList] = useState([]);

  const searchMoviesFunction = async (name: string) => {
    const response = await fetch(searchMovies(name));
    const json = await response.json();
    setSearchList(json.results);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        data={searchList}
        keyExtractor={(item: any) => item.id.toString()}
        bounces={false}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.InputHeaderContainer}>
            <InputHeader searchFunction={searchMoviesFunction} />
          </View>
        }
        contentContainerStyle={[
          styles.centerContainer,
          searchList.length === 0 && styles.centerMessageContainer, // Center message when empty
        ]}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>
            Start typing to search for movies!
          </Text>
        }
        renderItem={({item}) => (
          <SubMovieCard
            shoudlMarginatedAtEnd={false}
            shouldMarginatedAround={true}
            cardFunction={() => {
              navigation.push('MovieDetails', {movieid: item.id});
            }}
            cardWidth={width / 2 - SPACING.space_12 * 2}
            title={item.original_title}
            imagePath={baseImagePath('w342', item.poster_path)}
          />
        )}
      />
    </View>
  );  
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    width,
    alignItems: 'center',
    backgroundColor: COLORS.Black,
  },
  InputHeaderContainer: {
    display: 'flex',
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_28,
    marginBottom: SPACING.space_28 - SPACING.space_12,
  },
  centerContainer: {
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.WhiteRGBA32,
    textAlign: 'center',
  },
  centerMessageContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default SearchScreen;

import React, {useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const InputHeader = (props: any) => {
  const [searchText, setSearchText] = useState<string>('');
  const handleTextChange = (textInput: string) => {
    setSearchText(textInput);
    if (props.searchFunction) {
      props.searchFunction(textInput);
    }
  };
  
  const handleSearch = () => {
    if (searchText.trim().length > 0) {
      props.searchFunction(searchText);
    } else {
      console.warn("Search term is empty");
    }
  };
  return (
    <View style={styles.inputBox}>
      <TextInput
        style={styles.textInput}
        onChangeText={handleTextChange}
        value={searchText}
        placeholder="Search your Movies..."
        placeholderTextColor={COLORS.WhiteRGBA32}
      />
      <TouchableOpacity
        style={styles.searchIcon}
        onPress={handleSearch}>
        <Ionicons
          name="search"
          color={COLORS.Orange}
          size={FONTSIZE.size_20}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    display: 'flex',
    paddingVertical: SPACING.space_8,
    paddingHorizontal: SPACING.space_24,
    borderWidth: 2,
    borderColor: COLORS.WhiteRGBA15,
    borderRadius: BORDERRADIUS.radius_25,
    flexDirection: 'row',
  },
  textInput: {
    width: '90%',
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  searchIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.space_10,
  },
});

export default InputHeader;

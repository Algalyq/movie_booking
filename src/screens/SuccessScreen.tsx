import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle } from "lucide-react-native"; // Install lucide-react-native for icons
import { COLORS, SPACING } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const SuccessPage = () => {
    const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      {/* Success Icon in the Center */}
      <CheckCircle size={80} color={COLORS.Orange}/>

      <Text style={styles.message}>Your action was successful!</Text>
      
      <TouchableOpacity onPress={() => navigation.navigate("Ticket")}>
        <Text style={styles.backToHome}>Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.Black,
    gap: SPACING.space_12,
  },
  message: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.White,
  },
  backToHome: {
    fontSize: 16,
    color: COLORS.Orange,
  },
});

export default SuccessPage;

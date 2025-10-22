import { useNavigation } from "@react-navigation/native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  {
    id: "pgp555",
    title: "PGP 555",
    image: require("../../assets/images/coffee-icon.png"),
  },
  {
    id: "pgp777",
    title: "PGP 777",
    image: require("../../assets/images/coffee-icon.png"),
  },
  {
    id: "pgp2.25",
    title: "PGP 2.25",
    image: require("../../assets/images/coffee-icon.png"),
  },
];

const ProductCard = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.8}>
    <Card style={styles.card} mode="elevated">
      <Card.Cover source={item.image} style={styles.image} />
      <Card.Content style={styles.cardContent}>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {item.title}
        </Text>
      </Card.Content>
    </Card>
  </TouchableOpacity>
);

const Home = () => {
  const navigation = useNavigation();

  const handlePress = (item) => {
    navigation.navigate("ColorChart", { category: item });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Our Product Range</Text>

      <View style={styles.grid}>
        {categories.map((item) => (
          <ProductCard key={item.id} item={item} onPress={handlePress} />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8fa",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 10,
    color: "#1a237e",
    textAlign: "center",
  },
  grid: {
    marginTop: 10,
  },
  card: {
    width: "90%",
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    backgroundColor: "#fff",
  },
  image: {
    height:150
  },
  cardContent: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cardTitle: {
    fontWeight: "600",
    color: "#263238",
  },
});

export default Home;

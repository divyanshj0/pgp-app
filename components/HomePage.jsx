import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Text } from "react-native-paper";

const categories = [
  {
    id: "pgp555",
    title: "PGP 555",
    image: require("../assets/images/coffee-icon.png"),
  },
  {
    id: "pgp777",
    title: "PGP 777",
    image: require("../assets/images/coffee-icon.png"),
  },
  {
    id: "pgp2.25",
    title: "PGP 2.25",
    image: require("../assets/images/coffee-icon.png"),
  },
];

const ProductCard = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.8}>
    <Card style={styles.card} mode="elevated">
      <Card.Cover source={item.image} style={styles.cardImage} />
      <Card.Content style={styles.cardContent}>
        <Text variant="titleLarge" style={styles.cardTitle}>
          {item.title}
        </Text>
      </Card.Content>
    </Card>
  </TouchableOpacity>
);
export default function HomePage({ handlePress}) {
  return (
    <View style={styles.container} >
      <View style={styles.header}>
        <Text style={styles.headertext}>Our Product Range</Text>
      </View>
      <ScrollView>
        <View style={styles.grid}>
          {categories.map((item) => (
            <ProductCard key={item.id} item={item} onPress={() => handlePress(item.id)} />
          ))}
        </View>
      </ScrollView>
    </View >
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0F2",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center'
  },
  headertext: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#2C3E50",
    textAlign: "center",
  },
  grid: {
    paddingVertical: 10,
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

  },
  cardImage: {
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontWeight: "600",
    color: "#34495E",
    textAlign: 'center',
  },
});
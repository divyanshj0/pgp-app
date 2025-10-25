import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Text } from "react-native-paper";

const categories = [
  {
    id: "pgp555",
    title: "PGP 555",
    image: require("../assets/images/pgp555.png"),
  },
  {
    id: "pgp555(R)",
    title: "PGP 555(R)",
    image: require("../assets/images/pgp555(R).png"),
  },
  {
    id: "pgp2.25",
    title: "PGP 2.25",
    image: require("../assets/images/pgp225.png"),
  },
];

const ProductCard = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.8}>
    <Card style={styles.card} mode="elevated">
      <Card.Cover source={item.image} style={styles.cardImage} />
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
    paddingTop: 20,
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
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

  },
  cardImage: {
    height: 220,
    backgroundColor: '#f0f0f0',
  },
});
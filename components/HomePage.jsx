import { LinearGradient } from "expo-linear-gradient";
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
  <TouchableOpacity 
    onPress={() => onPress(item.id)} 
    activeOpacity={0.82} 
    style={styles.touchable}
  >
    <Card style={styles.card} mode="elevated">
      <View style={styles.cardImageContainer}>
        <Card.Cover source={item.image} style={styles.cardImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.10)']}
          style={styles.productOverlay}
        >
          <Text style={styles.productTitle}>{item.title}</Text>
        </LinearGradient>
      </View>
    </Card>
  </TouchableOpacity>
);

export default function HomePage({ handlePress }) {
  return (
    <View style={styles.container} >
      <LinearGradient
        colors={['#8b5cf6', '#6366f1']}
        style={styles.gradientHeader}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <Text style={styles.headertext}>Our Product Range</Text>
      </LinearGradient>
      <ScrollView>
        <View style={styles.grid}>
          {categories.map((item) => (
            <ProductCard key={item.id} item={item} onPress={handlePress} />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingTop: 0,
  },
  gradientHeader: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingVertical: 30,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  headertext: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.10)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  grid: {
    gap: 12,
    paddingHorizontal: 16,
  },
  card: {
    minHeight: 180,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.085,
    shadowRadius: 10,
    transition: "transform .15s",
  },
  cardImageContainer: {
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  cardImage: {
    height: 220,
    backgroundColor: "#e5e5e5",
  },
  productOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 10,
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "rgba(35, 20, 62, 0.08)",
  },
  productTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textShadowColor: "#0007",
    textShadowRadius: 5,
    letterSpacing: 0.7,
  },
});
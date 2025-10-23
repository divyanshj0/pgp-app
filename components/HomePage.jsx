import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

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
export default function HomePage({handlePress,handleBack}) {
    return (
        <SafeAreaView style={styles.container} >
            <View style={styles.header}>
                <Button style={styles.headerbutton} onPress={()=>handleBack()}>Back</Button>                
                <Text style={styles.headertext}>Our Product Range</Text>

            </View>

            <View style={styles.grid}>
                {categories.map((item) => (
                    <ProductCard key={item.id} item={item} onPress={()=>handlePress(item.id)} />
                ))}
            </View>
        </SafeAreaView >
    )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0F2",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header:{
    flexDirection:'row',
    gap:20,
    padding:5,
    alignItems:'center'
  },
  headerbutton:{
    borderRadius:10,
    padding:5,
    fontSize:20,
    textAlign:'center'
  },
  headertext: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#2C3E50",
    textAlign: "center",
  },
  grid: {
    paddingBottom: 16,
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
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontWeight: "600",
    color: "#34495E",
    marginBottom: 4,
    textAlign: 'center',
  },
});
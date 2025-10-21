import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const ProductCard = ({ title }) => (
  <Card style={styles.card}>
    <Card.Content>
      <Text variant="titleLarge">{title}</Text>
      {/* Add more details or image if needed */}
    </Card.Content>
  </Card>
);

const Home = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Products</Text>
      <ProductCard title="pgp555" />
      <ProductCard title="pgp777" />
      <ProductCard title="pgp2.25" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    alignItems: 'center', // Center cards horizontally
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: 'flex-start', // Align header to the left
  },
  card: {
    marginBottom: 20,
    width: '90%', // Adjust card width as needed
    borderRadius: 10,
    elevation: 3,
  },
});

export default Home;
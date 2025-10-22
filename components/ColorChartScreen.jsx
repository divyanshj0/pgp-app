import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Modal, Portal, Text, TextInput } from "react-native-paper";

const colors = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Color ${i + 1}`,
  hex: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
}));

const ColorChartScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [visible, setVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState("");

  const openModal = (color) => {
    setSelectedColor(color);
    setVisible(true);
  };

  const addToCart = () => {
    if (!quantity) return;
    // Store in AsyncStorage or context
    console.log("Added to cart:", { category: category.title, selectedColor, quantity });
    setVisible(false);
    setQuantity("");
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        {category.title} - Color Chart
      </Text>

      <FlatList
        data={colors}
        numColumns={5}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openModal(item)} style={styles.colorBox}>
            <View style={[styles.colorPreview, { backgroundColor: item.hex }]} />
          </TouchableOpacity>
        )}
      />

      {/* Quantity Modal */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Card>
            <Card.Content>
              <Text variant="titleMedium" style={styles.modalTitle}>
                {selectedColor?.name}
              </Text>
              <TextInput
                label="Enter Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <Button mode="contained" onPress={addToCart}>
                Add to Cart
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    padding: 10,
  },
  header: {
    fontWeight: "700",
    color: "#1a237e",
    textAlign: "center",
    marginBottom: 10,
  },
  colorBox: {
    width: "18%",
    aspectRatio: 1,
    margin: "1%",
    borderRadius: 6,
    elevation: 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  colorPreview: {
    width: "90%",
    height: "90%",
    borderRadius: 6,
  },
  modal: {
    margin: 20,
  },
  modalTitle: {
    marginBottom: 10,
  },
  input: {
    marginVertical: 10,
  },
});

export default ColorChartScreen;

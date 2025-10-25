import { useState } from "react";
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Modal, Portal, Surface, Text, TextInput } from "react-native-paper";
import { useCart } from "../context/CartContext";
import { predefinedColors } from "../data/colorsData";

const colors = predefinedColors.map(color => ({
  id: `color_${color.color_id}`,
  name: `Shade ${color.color_id}`,
  hex: color.color_hexcode,
}))


export default function ColorChart({ selectedcategory, handleBack }) {
  const [visible, setVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const { addToCart: addItemToCart } = useCart();

  const openModal = (color) => {
    setSelectedColor(color);
    setVisible(true);
    setQuantity("1");
  };

  const closeModal = () => {
    setVisible(false);
    setSelectedColor(null);
  }

  const handleAddToCart = () => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity greater than 0.");
      return;
    }
    const itemToAdd = {
      category: selectedcategory,
      colorId: selectedColor.id,
      colorHex: selectedColor.hex,
      color: selectedColor.name,
      quantity: numQuantity,
    };
    addItemToCart(itemToAdd);

    closeModal();
    Alert.alert("Added to Cart", `${numQuantity} x ${selectedColor.name} (${selectedcategory}) added.`);
  };


  const renderColorItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.colorTouchable}>
      <Surface style={styles.colorBox} elevation={2}>
        <View style={[styles.colorPreview, { backgroundColor: item.hex }]} />
        <Text style={styles.colorNameText} numberOfLines={1}>{item.name}</Text>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerbutton} onPress={() => handleBack()}>back</Text>
        <Text variant="headlineMedium" style={styles.headertext}>
          {selectedcategory}
        </Text>
      </View>

      <FlatList
        data={colors}
        renderItem={renderColorItem}
        numColumns={4}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
      />

      <Portal>
        <Modal visible={visible} onDismiss={closeModal} contentContainerStyle={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Card.Title
              title={selectedColor?.name || "Select Quantity"}
              subtitle={`Color Code: ${selectedColor?.hex || 'N/A'}`}
              titleStyle={styles.modalTitle}
              left={() => selectedColor ? <View style={[styles.modalColorSwatch, { backgroundColor: selectedColor.hex }]} /> : null}
            />
            <Card.Content>
              <TextInput
                label="Enter Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                dense
                autoFocus
              />
              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={closeModal} style={styles.modalButton}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleAddToCart} style={styles.modalButton}>
                  Add to Cart
                </Button>
              </View>
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
    backgroundColor: "#F8F9FA",
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    position: 'relative',
    backgroundColor: '#E8F0F2'
  },
  headerbutton: {
    position: 'absolute',
    top: 20,
    left: 15,
    fontSize: 15,
    color: "#fff",
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#000"
  },
  headertext: {
    fontWeight: "bold",
    color: "#1C2833",
    textAlign: "center",
  },
  listContentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  colorTouchable: {
    flex: 1 / 4,
    padding: 6,
  },
  colorBox: {
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
  },
  colorPreview: {
    width: "80%",
    height: "65%",
    borderRadius: 6,
    marginBottom: 5,
  },
  colorNameText: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  modalContainer: {
    padding: 20,
  },
  modalCard: {
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalColorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginLeft: 8,
  },
  input: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    marginLeft: 8,
  },
});
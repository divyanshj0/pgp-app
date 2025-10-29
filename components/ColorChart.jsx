import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, IconButton, Modal, Portal, Surface, Text, TextInput } from "react-native-paper";
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
    setQuantity("1");
    setVisible(true);
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
    <TouchableOpacity onPress={() => openModal(item)} activeOpacity={0.77} style={styles.colorTouchable}>
      <Surface style={styles.colorBox} elevation={4}>
        <LinearGradient
          colors={['#fff', item.hex]}
          style={styles.gradientPreview}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={[styles.colorPreview, { backgroundColor: item.hex }]} />
        </LinearGradient>
        <Text style={styles.colorNameText} numberOfLines={1}>{item.name}</Text>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8b5cf6', '#6366f1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <IconButton icon="arrow-left" size={22} iconColor="#fff" style={styles.headerBackIcon} onPress={handleBack} />
        <Text variant="headlineMedium" style={styles.headertext}>{selectedcategory}</Text>
      </LinearGradient>

      <FlatList
        data={colors}
        renderItem={renderColorItem}
        numColumns={4}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />

      <Portal>
        <Modal visible={visible} onDismiss={closeModal} contentContainerStyle={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Card.Title
              title={selectedColor?.name || "Select Quantity"}
              subtitle={`Color Code: ${selectedColor?.hex || 'N/A'}`}
              titleStyle={styles.modalTitle}
              subtitleStyle={styles.modalTitle}
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
                textColor="black"
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom:16,
    paddingHorizontal: 18,
    marginBottom: 8,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 3,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  headerBackIcon: {
    marginRight: 0,
    marginLeft: -4,
    backgroundColor: "rgba(255,255,255,0.13)"
  },
  headertext: {
    textAlign: "center",
    flex: 1,
    color: "#fff",
    fontWeight: "700",
    fontSize: 22,
    letterSpacing: 1,
  },
  listContentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    gap: 10,
  },
  colorTouchable: {
    flex: 1 / 4,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorBox: {
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.11,
    shadowRadius: 13,
    marginBottom: 2,
    height:92
  },
  gradientPreview: {
    width: "89%",
    height: "70%",
    marginTop: 3,
    borderRadius: 10,
    marginBottom: 7,
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
  },
  colorPreview: {
    width: "88%",
    height: "83%",
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: "#f2f3f8"
  },
  colorNameText: {
    fontSize: 10,
    color: '#28294d',
    fontWeight: "600",
    textAlign: 'center',
    paddingHorizontal: 2,
    letterSpacing: 0.06
  },
  modalContainer: {
    margin: 16,
    padding: 0,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 16,
    backgroundColor: "#ffffffee",
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  modalTitle: {
    fontWeight: "bold",
    color:"black",
    marginBottom: 4,
  },
  modalSubTitle: {
    fontWeight: "bold",
    color:"black",
  },
  modalColorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginLeft: 0,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#fbfcfc",
    color:'black',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingRight: 4,
  },
  modalButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    borderRadius: 9
  },
});
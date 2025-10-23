import { useState } from "react";
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Modal, Portal, Surface, Text, TextInput } from "react-native-paper"; // Added Surface
import { SafeAreaView } from "react-native-safe-area-context"; // Use SafeAreaView


const generateHexColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  const r = Math.floor(Math.random() * 155 + 50).toString(16).padStart(2, '0');
  const g = Math.floor(Math.random() * 155 + 50).toString(16).padStart(2, '0');
  const b = Math.floor(Math.random() * 155 + 50).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
};

const colors = Array.from({ length: 100 }, (_, i) => ({
  id: `color_${i + 1}`,
  name: `Shade ${i + 1}`,
  hex: generateHexColor(),
}));


export default function ColorChart({selectedcategory}){
  const [visible, setVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState("1");

  const openModal = (color) => {
    setSelectedColor(color);
    setVisible(true);
    setQuantity("1");
  };

  const closeModal = () => {
    setVisible(false);
    setSelectedColor(null);
  }

  const addToCart = () => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
       Alert.alert("Invalid Quantity", "Please enter a valid quantity greater than 0."); // Provide feedback
      return;
    }
    // --- Add to Cart Logic ---
    // Here you would typically dispatch an action to a state management library (like Redux or Zustand)
    // or update a context, or save directly to AsyncStorage.
    console.log("Added to cart:", {
      categoryTitle: selectedcategory,
      colorId: selectedColor.id,
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      quantity: numQuantity, // Use parsed quantity
    });
    // --- End Add to Cart Logic ---

    closeModal(); // Close modal after adding
    // Optionally navigate to cart or show confirmation
     Alert.alert("Added to Cart", `${numQuantity} x ${selectedColor.name} (${selectedcategory}) added.`);
  };


  // --- Render Item Component ---
  const renderColorItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.colorTouchable}>
      <Surface style={styles.colorBox} elevation={2}> {/* Use Surface for elevation */}
        <View style={[styles.colorPreview, { backgroundColor: item.hex }]} />
         {/* Show color name below swatch */}
        <Text style={styles.colorNameText} numberOfLines={1}>{item.name}</Text>
      </Surface>
    </TouchableOpacity>
  );
  // --- End Render Item Component ---

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.header}>
          {selectedcategory} - Select Color
        </Text>

        <FlatList
          data={colors}
          renderItem={renderColorItem} // Use the render component
          numColumns={4} // Adjust number of columns for better spacing
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />

        {/* --- Enhanced Quantity Modal --- */}
        <Portal>
          <Modal visible={visible} onDismiss={closeModal} contentContainerStyle={styles.modalContainer}>
             {/* Use Card for modal styling */}
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
                  mode="outlined" // Use outlined style
                  style={styles.input}
                  dense // Make input slightly smaller
                   autoFocus // Focus input when modal opens
                />
                 {/* Action buttons in a row */}
                <View style={styles.modalActions}>
                   <Button mode="outlined" onPress={closeModal} style={styles.modalButton}>
                     Cancel
                   </Button>
                   <Button mode="contained" onPress={addToCart} style={styles.modalButton}>
                     Add to Cart
                   </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
         {/* --- End Enhanced Modal --- */}
      </View>
    </SafeAreaView>
  );
};

// --- Updated Styles ---
const styles = StyleSheet.create({
   safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA", // Light background
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontWeight: "bold", // Bolder header
    color: "#1C2833", // Darker header color
    textAlign: "center",
    marginBottom: 20, // Increased margin
  },
   listContentContainer: {
    paddingBottom: 2, // Padding at the bottom of the list
  },
  colorTouchable: {
     flex: 1 / 4, // Makes it fit 4 columns
     padding: 6, // Padding around touchable for spacing
  },
  colorBox: {
    aspectRatio: 1, // Keep it square
    borderRadius: 8, // Slightly more rounded
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden', // Ensure content doesn't overflow rounded corners
  },
  colorPreview: {
    width: "80%", // Color swatch size
    height: "65%", // Adjust aspect ratio
    borderRadius: 6,
    marginBottom: 5, // Space between swatch and text
  },
   colorNameText: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 2, // Prevent text overflow
  },
  modalContainer: {
    padding: 20, // Use padding instead of margin for modal container
  },
   modalCard: {
     borderRadius: 12, // Rounded corners for modal card
   },
  modalTitle: {
    fontWeight: "bold",
    marginBottom: 15,
  },
   modalColorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15, // Make it circular
    borderWidth: 1,
    borderColor: '#ddd',
    marginLeft: 8, // Adjust positioning
  },
  input: {
    marginBottom: 20, // Space below input
  },
   modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align buttons to the right
    marginTop: 10,
  },
   modalButton: {
    marginLeft: 8, // Space between buttons
  },
});
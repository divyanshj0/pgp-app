import { useState } from "react";
import { View } from "react-native";
import ColorChartScreen from "../../components/ColorChart";
import HomePage from "../../components/HomePage";
export default function Home() {
  const [selectedcategory, setSelectedcategory] = useState('');
  const [ispressed, setIspressed] = useState(false);

  const handlePress = (item) => {
    setSelectedcategory(item);
    setIspressed(true);
  };
  const handleBack=()=>{
    setSelectedcategory('');
    setIspressed(false);
  }
  return (
      <View style={{flex:1}}>
        {ispressed ? (
          <ColorChartScreen
            selectedcategory={selectedcategory}
            handleBack={handleBack}
          />
        ) : (
          <HomePage
            handlePress={handlePress}
          />
        )
        }
      </View>
  )

};


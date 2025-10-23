import { useState } from "react";
import { ScrollView } from "react-native";
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
    selectedcategory('');
    setIspressed(false);
  }
  return (
      <ScrollView>
        {ispressed ? (
          <ColorChartScreen
            selectedcategory={selectedcategory}
          />
        ) : (
          <HomePage
            handlePress={handlePress}
            handleBack={handleBack}
          />
        )
        }
      </ScrollView>
  )

};


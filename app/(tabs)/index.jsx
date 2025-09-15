import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const Home = () => {
  return (
    <SafeAreaView style={{flex:1}}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Welcome to the Home Screen!</Text>
      </View>
    </SafeAreaView>
  );
};

export default Home;
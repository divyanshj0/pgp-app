import { View, Text ,StyleSheet,ImageBackground} from 'react-native'
import icedCoffeImg from "@/assets/images/iced-coffee.png"
import React from 'react'
const app = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={icedCoffeImg}
        resizeMode='cover'
        style={styles.image}
      >
        <Text style={styles.text}>index</Text>
      </ImageBackground>
    </View>
  )
}

export default app

const styles=StyleSheet.create({
  container:{
    flex:1,
    flexDirection:'column'

  },
  image:{
    width:"100%",
    height:"100%",
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },
  text:{
    color:'white',
    fontSize:36,
    fontWeight:'bold',
    textAlign:'center'
  }
})
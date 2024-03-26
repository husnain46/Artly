import React from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const GettingStarted = ({navigation}) => {
  const gotoSignup = () => {
    navigation.navigate('Signup');
  };
  const gotoLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../Assets/background.png')}
        style={styles.bgImage}
        resizeMode="stretch">
        <View style={styles.content}>
          <View
            style={{
              alignItems: 'flex-start',
              marginTop: 30,
            }}>
            <Image
              source={require('../Assets/logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.btnView}>
          <TouchableOpacity style={styles.button1} onPress={() => gotoLogin()}>
            <Text style={styles.btnText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button2} onPress={() => gotoSignup()}>
            <Text style={styles.btnText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
    width: width,
    height: height,
  },
  content: {
    flex: 0.95,
  },
  logoImg: {
    width: 180,
    height: 90,
  },
  mottoTxt: {
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#442e65',
    marginTop: 10,
  },
  btnView: {
    flexDirection: 'row',
    height: 70,
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button1: {
    position: 'relative',
    width: 140,
    marginHorizontal: 15,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    backgroundColor: '#6750a4',
    elevation: 20,
    borderWidth: 2,
  },
  button2: {
    position: 'relative',
    width: 140,
    justifyContent: 'center',
    marginHorizontal: 15,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#01ba76',
    elevation: 20,
    borderWidth: 2,
  },
  btnText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: 20,
  },
});

export default GettingStarted;

import {
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {Button, TextInput, Title} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import database from '@react-native-firebase/database';
import {CommonActions} from '@react-navigation/native';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (email && password) {
      setIsLoading(true);

      auth()
        .signInWithEmailAndPassword(email, password)
        .then(async userCredential => {
          const user = userCredential.user;
          if (user.emailVerified) {
            checkProfile(user.uid);
          } else {
            setIsLoading(false);
            await user.sendEmailVerification();
            Toast.show({
              type: 'error',
              text1: 'Email not verified!',
              text2: 'Please check your email and verify.',
            });

            await auth().signOut();
          }
        })
        .catch(error => {
          setIsLoading(false);
          console.log(error);

          if (error.code === 'auth/user-not-found') {
            Toast.show({
              type: 'error',
              text1: 'No user found with this email.',
            });
          } else if (error.code === 'auth/wrong-password') {
            Toast.show({
              type: 'error',
              text1: 'Incorrect password.',
            });
          } else if (error.code === 'auth/invalid-email') {
            Toast.show({
              type: 'error',
              text1:
                'Invalid email format. Please enter a valid email address.',
            });
          } else if (error.code === 'auth/invalid-credential') {
            Toast.show({
              type: 'error',
              text1: 'Invalid credentials!',
            });
          } else {
            Toast.show({
              type: 'error',
              text1: 'An error occurred! Please try after sometime.',
            });
          }
        });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Empty fields',
        text2: 'Please enter email/password to login.',
      });
    }
  };

  const checkProfile = userId => {
    const userRef = database().ref(`/users/${userId}`);

    userRef
      .once('value')
      .then(snapshot => {
        // Handle the snapshot data
        const userData = snapshot.val();
        if (snapshot.exists()) {
          if (userData.role === 'admin') {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'AdminProfile'}],
              }),
            );
          } else {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'Home'}],
              }),
            );
          }
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'Home'}],
            }),
          );
        }

        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'An error occurred!',
        });
      });
  };

  const handleGoogleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const credential = auth.GoogleAuthProvider.credential(userInfo.idToken);
      const user = await auth().signInWithCredential(credential);
      if (user) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Home'}],
          }),
        );
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An error occurred!',
        text2: 'Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <Title
            style={{
              fontWeight: '600',
              textAlign: 'center',
              color: '#2537a0',
            }}>
            Login
          </Title>

          <View style={{width: '80%', marginTop: 40, alignSelf: 'center'}}>
            <TextInput
              style={styles.input}
              value={email}
              mode="outlined"
              onChangeText={text => setEmail(text)}
              keyboardType="email-address"
              outlineStyle={{borderRadius: 8}}
              label={'Email'}
            />

            <TextInput
              style={styles.input}
              value={password}
              mode="outlined"
              onChangeText={text => setPassword(text)}
              secureTextEntry
              outlineStyle={{borderRadius: 8}}
              label={'Password'}
            />
          </View>

          <Button
            onPress={handleLogin}
            mode="contained"
            loading={isLoading}
            buttonColor="#01ba76"
            labelStyle={{fontSize: 16, fontWeight: '700'}}
            style={styles.loginBtn}>
            Login
          </Button>

          <Text
            style={{
              fontSize: 15,
              fontWeight: '500',
              color: 'grey',
              marginTop: 30,
              marginBottom: 40,
              textAlign: 'center',
            }}>
            Or
          </Text>

          <View style={{width: '100%', alignSelf: 'center'}}>
            <GoogleSigninButton
              style={{width: '70%', alignSelf: 'center'}}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={handleGoogleSignin}
            />

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PhoneView', {label: 'Sign in'})
              }
              style={styles.phoneBtn}>
              <Image
                source={require('../Assets/phone.png')}
                style={{
                  width: '21%',
                  height: 18,
                  tintColor: 'white',
                }}
                resizeMode="contain"
              />
              <Text
                style={{
                  width: '68%',
                  fontSize: 13.5,
                  color: 'white',
                  fontWeight: '600',
                }}>
                Sign in with Phone
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    backgroundColor: 'white',
    marginTop: 15,
    width: '100%',
    fontSize: 14,
    height: 45,
    alignSelf: 'center',
  },
  loginBtn: {
    borderRadius: 10,
    width: '50%',
    alignSelf: 'center',
    marginTop: 60,
  },
  phoneBtn: {
    borderRadius: 5,
    marginTop: 20,
    width: '68%',
    height: 40,
    alignItems: 'center',
    borderBottomWidth: 2,
    elevation: 5,
    borderBottomColor: 'grey',
    alignSelf: 'center',
    backgroundColor: '#6750a4',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Login;

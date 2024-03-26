// SignupScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import PhoneNumberInput from 'react-native-phone-number-input';
import {Button, Icon, TextInput, Title} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {CommonActions} from '@react-navigation/native';

GoogleSignin.configure({
  webClientId:
    '206043122284-kvql6c6l2c24uap62fq24ei2se30nf3o.apps.googleusercontent.com', // Get this from the Firebase console
});

const Signup = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [passError, setPassError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = text => {
    setPassword(text);
    validatePassword(text);
  };

  // Function to validate the password
  const validatePassword = text => {
    if (text.length < 6) {
      setPassError('Password must be at least 6 characters long');
    } else if (text.includes(' ')) {
      setPassError('Password cannot contain spaces');
    } else {
      setPassError('');
    }
  };

  function handleConfirmPass(text) {
    setConfirmPass(text);
    if (text !== password) {
      setConfirmError('Password does not match!');
    } else {
      setConfirmError('');
    }
  }

  const handleEmailSignup = async () => {
    try {
      if (passError !== '' || confirmError !== '' || !isEmailValid) {
        Toast.show({
          type: 'error',
          text1: 'Please fill the fields correctly!',
        });
      } else if (email === '' || password === '' || confirmPass === '') {
        Toast.show({
          type: 'error',
          text1: 'Please fill all the fields!',
        });
      } else {
        setLoading(true);
        await auth()
          .createUserWithEmailAndPassword(email, password)
          .then(async userCredential => {
            const user = userCredential.user;

            if (user) {
              await user.sendEmailVerification();
            } else {
              Toast.show({
                type: 'error',
                text1: 'An error occurred! Please try again.',
              });
            }
          })
          .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
              Toast.show({
                type: 'error',
                text1: 'The email is already in use!',
                text2: 'Try another email for signup.',
              });
            } else {
              Toast.show({
                type: 'error',
                text1: 'An error occurred! Please try again later.',
              });
            }
          })
          .finally(() => {
            // Set loading to false when the signup process is complete
            setLoading(false);

            Alert.alert(
              'Verify Email!',
              'Email verification sent. Please check your email and verify.',
              [
                {
                  text: 'Go to Login',
                  onPress: () =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: 'Login'}],
                      }),
                    ),
                },
              ],
            );
          });
        // Handle success or navigate to the next screen
      }
    } catch (error) {
      console.error('Error signing up with email:', error);
    }
  };

  const handleGoogleSignup = async () => {
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
      console.error('Error signing up with Google:', error);
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
            Sign up
          </Title>

          <View style={{width: '80%', marginTop: 40, alignSelf: 'center'}}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '400',
                color: 'black',
                top: 10,
              }}>
              Sign up with email:
            </Text>

            <TextInput
              style={styles.input}
              value={email}
              mode="outlined"
              onChangeText={text => {
                setEmail(text);
                if (emailPattern.test(text)) {
                  setIsEmailValid(true);
                } else {
                  setIsEmailValid(false);
                }
              }}
              keyboardType="email-address"
              outlineStyle={{borderRadius: 10}}
              label={'Email'}
            />

            {email.length > 0 && !isEmailValid ? (
              <Text style={styles.errorText}>Email address is not valid!</Text>
            ) : (
              <></>
            )}

            <TextInput
              style={styles.input}
              value={password}
              mode="outlined"
              onChangeText={handlePasswordChange}
              secureTextEntry
              outlineStyle={{borderRadius: 10}}
              label={'Password'}
            />
            {passError !== '' ? (
              <Text style={styles.errorText}>{passError}</Text>
            ) : (
              <></>
            )}

            <TextInput
              style={styles.input}
              mode="outlined"
              value={confirmPass}
              onChangeText={text => handleConfirmPass(text)}
              secureTextEntry
              outlineStyle={{borderRadius: 10}}
              label={'Confirm Password'}
            />
            {confirmError !== '' ? (
              <Text style={styles.errorText}>{confirmError}</Text>
            ) : (
              <></>
            )}
          </View>

          <Button
            onPress={handleEmailSignup}
            mode="contained"
            loading={loading}
            buttonColor="#01ba76"
            labelStyle={{fontSize: 16, fontWeight: '700'}}
            style={styles.signupBtn}>
            Sign up
          </Button>

          <Text
            style={{
              fontSize: 15,
              fontWeight: '500',
              color: 'grey',
              marginVertical: 20,
              textAlign: 'center',
            }}>
            Or
          </Text>

          <View style={{width: '100%', alignSelf: 'center'}}>
            <GoogleSigninButton
              style={{width: '70%', alignSelf: 'center'}}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={handleGoogleSignup}
            />

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PhoneView', {label: 'Sign up'})
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
                  width: '65%',
                  fontSize: 13.5,
                  color: 'white',
                  fontWeight: '600',
                }}>
                Sign up with Phone
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
    height: 40,
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 3,
  },
  signupBtn: {
    borderRadius: 10,
    width: '50%',
    alignSelf: 'center',
    marginVertical: 40,
  },
  phoneBtn: {
    borderRadius: 5,
    marginTop: 10,
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

export default Signup;

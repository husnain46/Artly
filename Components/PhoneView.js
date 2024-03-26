import auth from '@react-native-firebase/auth';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useState} from 'react';
import {
  Alert,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Button} from 'react-native-paper';
import PhoneInput from 'react-native-phone-number-input';
import Toast from 'react-native-toast-message';
import {OtpInput} from 'react-native-otp-entry';
import {CommonActions} from '@react-navigation/native';

const PhoneView = ({navigation, route}) => {
  const {label} = route.params;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null); // If null, no SMS has been sent

  const [showOTP, setShowOTP] = useState(false);

  const [disableVerify, setDisableVerify] = useState(true);

  // verification code (OTP - One-Time-Passcode)
  const [otpCode, setOtpCode] = useState('');

  const handlePhoneSignup = async () => {
    try {
      if (phoneNumber === '') {
        Toast.show({
          type: 'error',
          text1: 'Enter a phone number!',
        });
      } else {
        setLoading(true);

        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);

        if (confirmation) {
          setConfirm(confirmation);
          setShowOTP(true);
        }

        setLoading(false);
      }
    } catch (error) {
      setLoading(false);

      console.log(error);
      if (error.code === 'auth/invalid-phone-number') {
        Alert.alert(
          'Invalid Phone Number!',
          'Enter a valid phone number to sign up.',
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'An unexpected error occurred!',
          text2: 'Please try after some time.',
        });
      }
    }
  };

  const OtpVerify = async () => {
    try {
      setLoading(true);
      let data = await confirm.confirm(otpCode);
      if (data) {
        setLoading(false);

        Toast.show({
          type: 'success',
          text1: 'You signed in successfully!',
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Home'}],
          }),
        );
      }
    } catch (error) {
      if (error.code === 'auth/invalid-verification-code') {
        Toast.show({
          type: 'error',
          text1: 'Invalid Code!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'An unexpected error occurred!',
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{width: '100%', flex: 1}}>
          {!showOTP ? (
            <View style={{width: '90%', alignSelf: 'center', marginTop: 20}}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: 'black',
                  marginVertical: 10,
                }}>
                {label} with phone:
              </Text>
              <PhoneInput
                value={phoneNumber}
                onChangeFormattedText={text => setPhoneNumber(text)}
                defaultCode="PK"
                codeTextStyle={{marginVertical: -10}}
                textContainerStyle={{
                  alignItems: 'center',
                  backgroundColor: 'white',
                }}
                textInputStyle={{padding: 0, marginVertical: -10}}
                containerStyle={{
                  alignItems: 'center',
                  borderWidth: 1,
                  height: 50,
                  borderRadius: 10,
                  width: '99%',
                }}
                placeholder="Enter phone number"
                textInputProps={{placeholderTextColor: 'grey'}}
              />

              <Button
                onPress={handlePhoneSignup}
                mode="contained"
                loading={loading}
                buttonColor="#01ba76"
                labelStyle={{fontSize: 16, fontWeight: '700'}}
                style={styles.signupBtn}>
                {label}
              </Button>
            </View>
          ) : (
            <View
              style={{
                width: '100%',
                alignSelf: 'center',
                marginTop: 20,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'black',
                  left: 5,
                }}>
                Enter OTP
              </Text>

              <OtpInput
                numberOfDigits={6}
                focusColor="green"
                focusStickBlinkingDuration={500}
                onTextChange={text => setOtpCode(text)}
                onFilled={text => {
                  setOtpCode(text), setDisableVerify(false);
                }}
                theme={{
                  containerStyle: styles.otpContainer,
                  inputsContainerStyle: styles.inputsContainer,
                  pinCodeContainerStyle: styles.pinCodeContainer,
                  pinCodeTextStyle: styles.pinCodeText,
                  focusStickStyle: styles.focusStick,
                  focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                }}
              />
              <Button
                onPress={OtpVerify}
                mode="contained"
                loading={loading}
                disabled={disableVerify}
                buttonColor="#6750a4"
                labelStyle={{fontSize: 16, fontWeight: '700'}}
                style={styles.signupBtn}>
                Verify
              </Button>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  signupBtn: {
    borderRadius: 10,
    width: '45%',
    alignSelf: 'center',
    marginTop: 50,
  },
  otpContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pinCodeContainer: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 5,
    margin: 5,
  },
  pinCodeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  focusStick: {
    backgroundColor: 'green',
  },
  activePinCodeContainer: {
    backgroundColor: '#95dbbe',
  },
});

export default PhoneView;

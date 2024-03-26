import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  List,
  Divider,
  Button,
  TextInput,
  RadioButton,
} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import Toast from 'react-native-toast-message';
import {Picker} from '@react-native-picker/picker';
import {CommonActions} from '@react-navigation/native';
import AlertPro from 'react-native-alert-pro';

const Home = ({navigation}) => {
  const [userId, setUserId] = useState('');

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [allowEdit, setAllowEdit] = useState(false);
  const phonePattern = /^03[0-4][0-9]{8}$/;
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const alertRef = useRef([]);
  const deleteAlert = useRef([]);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setLogLoading(true);
        setUserId(user.uid);

        const userRef = database().ref(`/users/${user.uid}`);
        userRef.once('value').then(snapshot => {
          const userData = snapshot.val();
          if (userData) {
            setName(userData.name);
            setAge(userData.age);
            setGender(userData.gender);
            setPhoneNumber(userData.phone);
            setRole(userData.role);
            setLogLoading(false);
          } else {
            if (user.phoneNumber) {
              const num = user.phoneNumber.slice(-10);
              setPhoneNumber(`0${num}`);
            }
            setAllowEdit(true);
            setLogLoading(false);
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      alertRef.current.close();
      setLogLoading(true);
      await auth().signOut();
      setLogLoading(false);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'GettingStarted'}],
        }),
      );
    } catch (error) {
      setLogLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error logging out!',
      });
    }
  };

  const handleDeleteProfile = async () => {
    try {
      deleteAlert.current.close();
      setLoading(true);

      // Delete user data from the database
      await database().ref(`/users/${userId}`).remove();

      // Delete user authentication account
      await auth().currentUser.delete();

      setLoading(false);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'GettingStarted'}],
        }),
      );

      Toast.show({
        type: 'info',
        text1: 'Your profile has been deleted!',
      });
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error deleting profile!',
      });
    }
  };

  const handleSaveProfile = () => {
    if (name === '' || age === '' || gender === '' || phoneNumber === '') {
      Toast.show({
        type: 'error',
        text2: 'Please fill in all fields!',
      });
    } else if (!isPhoneValid) {
      Toast.show({
        type: 'error',
        text2: 'Enter a valid phone number',
      });
    } else {
      setLoading(true);
      const userRef = database().ref(`/users/${userId}`);
      userRef
        .update({
          name,
          age,
          gender,
          phone: phoneNumber,
          role,
        })
        .then(() => {
          setLoading(false);
          Toast.show({
            type: 'success',
            text1: 'Profile saved successfully!',
          });
          setAllowEdit(false);
        })
        .catch(error => {
          setLoading(false);

          Toast.show({
            type: 'error',
            text1: 'Error saving data!',
          });
        });
    }
  };

  if (logLoading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" color="blue" animating={logLoading} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{width: '100%', flex: 1}}>
          <View
            style={{alignItems: 'center', marginBottom: 30, marginTop: -10}}>
            <Image
              source={require('../Assets/logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>

          <AlertPro
            ref={ref => (deleteAlert.current = ref)}
            onConfirm={handleDeleteProfile}
            onCancel={() => deleteAlert.current.close()}
            title="Delete Profile?"
            message="Are you sure you want to delete your profile?"
            textCancel="No"
            textConfirm="Yes"
            customStyles={{
              mask: {
                backgroundColor: 'transparent',
              },
              message: {marginBottom: 10},
              container: {
                borderWidth: 2,
                borderColor: 'lightgrey',
                shadowColor: '#000000',
                shadowOpacity: 0.1,
                shadowRadius: 10,
              },
              buttonCancel: {
                backgroundColor: '#4da6ff',
              },
              buttonConfirm: {
                backgroundColor: 'red',
              },
            }}
          />

          <AlertPro
            ref={ref => (alertRef.current = ref)}
            onConfirm={handleLogout}
            onCancel={() => alertRef.current.close()}
            title="Logout?"
            message="Are you sure you want to logout?"
            textCancel="No"
            textConfirm="Yes"
            customStyles={{
              mask: {
                backgroundColor: 'transparent',
              },
              message: {marginBottom: 10},
              container: {
                borderWidth: 2,
                borderColor: 'lightgrey',
                shadowColor: '#000000',
                shadowOpacity: 0.1,
                shadowRadius: 10,
              },
              buttonCancel: {
                backgroundColor: '#4da6ff',
              },
              buttonConfirm: {
                backgroundColor: 'red',
              },
            }}
          />

          <View
            style={{
              width: '85%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              alignSelf: 'center',
              marginBottom: 8,
            }}>
            <Text style={styles.heading}>My Profile</Text>

            {allowEdit ? (
              <TouchableOpacity onPress={() => setAllowEdit(false)}>
                <Image
                  source={require('../Assets/close.png')}
                  style={{width: 28, height: 28, tintColor: '#613194'}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setAllowEdit(true)}>
                <Image
                  source={require('../Assets/edit.png')}
                  style={{width: 28, height: 28, tintColor: '#613194'}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
          <Divider style={{height: 0.6, width: '85%', alignSelf: 'center'}} />

          <TextInput
            label="Name"
            value={name}
            onChangeText={text => setName(text)}
            style={styles.input}
            disabled={!allowEdit}
            contentStyle={{color: 'black'}}
          />
          <TextInput
            label="Age"
            value={age}
            inputMode="numeric"
            onChangeText={text => setAge(text)}
            style={styles.input}
            contentStyle={{color: 'black'}}
            keyboardType="numeric"
            disabled={!allowEdit}
          />

          {!allowEdit ? (
            <TextInput
              label="Gender"
              value={gender}
              onChangeText={text => setGender(text)}
              style={styles.input}
              contentStyle={{color: 'black'}}
              disabled={!allowEdit}
            />
          ) : (
            <View style={styles.radioView}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginEnd: 30,
                }}>
                <Text style={styles.radioText}>Male</Text>
                <RadioButton
                  value="first"
                  status={gender === 'Male' ? 'checked' : 'unchecked'}
                  onPress={() => setGender('Male')}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text style={styles.radioText}>Female</Text>
                <RadioButton
                  value="Female"
                  status={gender === 'Female' ? 'checked' : 'unchecked'}
                  onPress={() => setGender('Female')}
                />
              </View>
            </View>
          )}
          <TextInput
            label="Phone Number (e.g. 03xxxxxxxxx)"
            value={phoneNumber}
            onChangeText={text => {
              setPhoneNumber(text);
              if (phonePattern.test(text)) {
                setIsPhoneValid(true);
              } else {
                setIsPhoneValid(false);
              }
            }}
            style={styles.input}
            inputMode="tel"
            textContentType="telephoneNumber"
            keyboardType="phone-pad"
            disabled={!allowEdit}
            contentStyle={{color: 'black'}}
          />
          {phoneNumber.length > 0 && !isPhoneValid ? (
            <Text style={styles.errorText}>Phone number is not valid!</Text>
          ) : (
            <></>
          )}

          <View style={styles.pickerView}>
            <Picker
              selectedValue={role}
              selectionColor={'black'}
              itemStyle={{color: 'blue'}}
              enabled={allowEdit}
              onValueChange={(itemValue, itemIndex) => setRole(itemValue)}
              style={styles.pickerStyle}
              mode="dropdown"
              dropdownIconColor={allowEdit ? 'black' : 'darkgrey'}>
              <Picker.Item
                enabled={false}
                style={{
                  fontSize: 15.5,
                  color: 'grey',
                  backgroundColor: '#f0f0f0',
                }}
                label="Select Role"
                value=""
              />
              <Picker.Item
                style={{
                  fontSize: 15.5,
                  color: 'black',
                  backgroundColor: '#f0f0f0',
                }}
                label="Visitor"
                value="visitor"
              />
              <Picker.Item
                style={{
                  fontSize: 15.5,
                  color: 'black',
                  backgroundColor: '#f0f0f0',
                }}
                label="Artist"
                value="artist"
              />
            </Picker>
          </View>

          {!allowEdit ? (
            <View>
              <Button
                mode="contained"
                buttonColor="#ed2f21"
                onPress={() => deleteAlert.current.open()}
                disabled={allowEdit}
                loading={loading}
                style={styles.saveButton}>
                Delete Profile
              </Button>

              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  marginTop: 45,
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 10,
                }}
                onPress={() => alertRef.current.open()}>
                <Image
                  source={require('../Assets/logout.png')}
                  style={{width: 25, height: 25, tintColor: 'red'}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={handleSaveProfile}
              loading={loading}
              style={styles.saveButton}>
              Save Profile
            </Button>
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
    backgroundColor: '#fff',
  },
  logoImg: {
    width: 120,
    height: 120,
    tintColor: '#dbab09',
  },
  heading: {
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
    color: '#613194',
  },
  input: {
    marginTop: 12,
    width: '85%',
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
  },
  pickerView: {
    marginTop: 12,
    width: '85%',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    alignSelf: 'center',
    borderBottomWidth: 1,
  },
  pickerStyle: {
    width: '100%',
  },
  radioView: {
    width: '85%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    marginLeft: 8,
  },
  radioText: {
    fontSize: 17,
    color: 'black',
    marginRight: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 3,
    width: '85%',
    alignSelf: 'center',
  },
  saveButton: {
    marginTop: 40,
    width: '50%',
    alignSelf: 'center',
    borderRadius: 10,
  },
});

export default Home;

import 'react-native-gesture-handler';
import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import Home from './Screens/Home';
import Signup from './Screens/Signup';
import AdminProfile from './Screens/AdminProfile';
import Login from './Screens/Login';
import PhoneView from './Components/PhoneView';
import GettingStarted from './Screens/GettingStarted';
import database from '@react-native-firebase/database';

const Stack = createStackNavigator();

const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#08c979'}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 14,
        fontWeight: '400',
      }}
      text2Style={{
        fontSize: 12,
      }}
    />
  ),

  error: props => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 14,
        fontWeight: '400',
      }}
      text2Style={{
        fontSize: 12,
      }}
    />
  ),

  info: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: 'blue',
        maxHeight: 100,
      }}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 14,
        fontWeight: '400',
      }}
      text2Style={{
        fontSize: 12,
      }}
    />
  ),
};

export default function App() {
  const [routeName, setRouteName] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        const userRef = database().ref(`/users/${user.uid}`);

        userRef
          .once('value')
          .then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
              const role = userData.role;
              if (role === 'admin') {
                setRouteName('AdminProfile');
              } else {
                setRouteName('Home');
              }
            } else {
              setRouteName('Home');
            }
          })
          .catch(error => {
            Toast.show({
              type: 'error',
              text1: 'An unexpected error occurred!',
            });
          });
      } else {
        setRouteName('GettingStarted');
      }
    });

    return () => unsubscribe();
  }, []);

  if (routeName === null) {
    return (
      <ActivityIndicator
        size={'large'}
        style={{flex: 1, alignSelf: 'center'}}
      />
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={routeName}
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="GettingStarted" component={GettingStarted} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="PhoneView" component={PhoneView} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="AdminProfile" component={AdminProfile} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  );
}

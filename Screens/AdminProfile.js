// Import necessary components and libraries
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {List, Divider, Button, IconButton} from 'react-native-paper';

// Replace this with your authentication and database import
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import AlertPro from 'react-native-alert-pro';
import Toast from 'react-native-toast-message';
import {CommonActions} from '@react-navigation/native';

const AdminProfile = ({navigation}) => {
  const [artists, setArtists] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const alertRef = useRef([]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setLoading(true);
        const userRef = database().ref(`/users/${user.uid}`);
        userRef.once('value').then(snapshot => {
          const userData = snapshot.val();
          if (userData && userData.role === 'admin') {
            // Subscribe to real-time changes for users
            const usersRef = database().ref('/users');
            usersRef.on('value', snapshot => {
              const usersData = snapshot.val();
              if (usersData) {
                const usersList = Object.values(usersData);
                const artistsList = usersList.filter(
                  user => user.role === 'artist',
                );
                const visitorsList = usersList.filter(
                  user => user.role === 'visitor',
                );
                setArtists(artistsList);
                setVisitors(visitorsList);
              }
              setLoading(false);
            });
          }
        });
      }
    });

    return () => {
      // Unsubscribe from real-time changes when the component is unmounted
      unsubscribe();
      database().ref('/users').off('value');
    };
  }, []);

  const handleLogout = async () => {
    try {
      alertRef.current.close();
      setLoading(true);
      await auth().signOut();
      setLoading(false);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'GettingStarted'}],
        }),
      );
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error logging out!',
      });
    }
  };

  const renderArtists = ({item, index}) => {
    let num = index + 1;
    return (
      <View style={{width: '100%'}}>
        <List.Item
          title={item.name}
          style={{paddingVertical: 7}}
          description={() => (
            <View
              style={{
                width: '100%',
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <Text style={{fontSize: 13, color: 'black', letterSpacing: 0.6}}>
                Age: {item.age}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  marginLeft: 20,
                  letterSpacing: 0.6,
                }}>
                {item.gender}
              </Text>
            </View>
          )}
        />
        <Divider style={{height: 0.9, width: '92%', alignSelf: 'center'}} />
      </View>
    );
  };

  const renderVisitors = ({item}) => {
    return (
      <View style={{width: '100%'}}>
        <List.Item
          title={item.name}
          style={{paddingVertical: 7}}
          description={() => (
            <View
              style={{
                width: '100%',
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <Text style={{fontSize: 13, color: 'black', letterSpacing: 0.6}}>
                Age: {item.age}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  marginLeft: 20,
                  letterSpacing: 0.6,
                }}>
                {item.gender}
              </Text>
            </View>
          )}
        />
        <Divider style={{height: 0.9, width: '92%', alignSelf: 'center'}} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" animating={loading} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 7,
        }}>
        <Text style={styles.heading}>Admin Dashboard</Text>

        <TouchableOpacity onPress={() => alertRef.current.open()}>
          <Image
            source={require('../Assets/logout.png')}
            style={{width: 25, height: 25, tintColor: 'red'}}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <Divider style={{height: 1.5}} />

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

      <List.Section>
        <List.Subheader style={styles.subHeader}>(Artists)</List.Subheader>
        <FlatList
          data={artists}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderArtists}
          ListEmptyComponent={() => {
            return (
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: 'grey'}}>No visitors yet!</Text>
              </View>
            );
          }}
        />
      </List.Section>

      <List.Section>
        <List.Subheader style={styles.subHeader}>(Visitors)</List.Subheader>
        <FlatList
          data={visitors}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderVisitors}
          ListEmptyComponent={() => {
            return (
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: 'grey'}}>No visitors yet!</Text>
              </View>
            );
          }}
        />
      </List.Section>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#544597',
  },
  subHeader: {
    fontSize: 17,
    color: 'black',
    fontWeight: '700',
    textAlign: 'center',
  },
  addButton: {
    marginBottom: 16,
  },
});

export default AdminProfile;

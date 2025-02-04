import Paho from 'paho-mqtt'; //https://www.eclipse.org/paho/files/jsdoc/index.html

import {useState, useContext} from 'react';
//import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  Button,
  View,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import React from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {PageContext, PageContextProvider} from './context/pageContext';

const Tab = createBottomTabNavigator();

export const SettingsContext = React.createContext();

const client = new Paho.Client(
  'adeptuscat.ddns.net',
  Number(9001),
  `mqtt-async-test-${parseInt(Math.random() * 100, 10)}`,
);

const images = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eclectus_roratus_in_Zoo_Augsburg.jpg/1280px-Eclectus_roratus_in_Zoo_Augsburg.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e0/Green-park.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/26/Skyscraper_Los_Angeles_Downtown_2013.jpg',
];

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const imgKeys = [];
const dotKeys = [];

const once = false;

export default function App() {
  return (
    <PageContextProvider>
      <Page />
    </PageContextProvider>
  );
}

const Page = () => {
  const {connected, setConnected, name} = useContext(PageContext);

  const statusString = 'Katzomat Status:';
  const [value, setValue] = useState(0);
  const [status, setStatus] = useState(`${statusString} unkown`);
  const [password, setPassword] = useState('katz!');
  const [domain, setDomain] = useState('adeptuscat.ddns.net');
  const [dir, setDir] = useState(`katzomat/${name}`);
  const [img, setImg] = useState('Base64ImgHere');
  const [imgs, setImgs] = useState([
    {
      timestamp: 1661360552, //1661360551
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eclectus_roratus_in_Zoo_Augsburg.jpg/1280px-Eclectus_roratus_in_Zoo_Augsburg.jpg',
      date: 'fsfasdf',
    },
  ]);
  const [timetable, setTimetable] = useState([]);

  function onMessage(message) {
    if (message.destinationName === `katzomat/${name}/status`) {
      setStatus(`${statusString} ${message.payloadString}`);
    }
    if (message.destinationName === `katzomat/${name}/status/verbose`) {
      //console.log(message.payloadString);
    }
    const str = `katzomat/${name}/images`;
    const re = message.destinationName.match(str);
    if (re != null) {
      if (message.destinationName === `katzomat/${name}/images/take`) {
        return;
      }
      const obj = JSON.parse(message.payloadString);
      const base64Img = `data:image/png;base64,${obj.value}`;
      const timestamp = parseInt(obj.timestamp, 10);
      //setImg(base64Img);
      for (let i = 0; i < imgs.length; i++) {
        //console.log(timestamp);
        //console.log(imgs[i].timestamp);
        //console.log('next');
        if (imgs[i].timestamp === timestamp) {
          console.log('has img already');
          return;
        }
      }
      setImg(base64Img);
      const date = new Date(timestamp * 1000);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDay();
      const hours = date.getHours();
      const minutes = '0' + date.getMinutes();
      const seconds = '0' + date.getSeconds();
      const formattedTime =
        day +
        '.' +
        month +
        '.' +
        year +
        ' ' +
        hours +
        ':' +
        minutes.substr(-2) +
        ':' +
        seconds.substr(-2);
      const arr = imgs;
      arr.push({
        timestamp: timestamp,
        uri: base64Img,
        date: formattedTime,
      });
      arr.sort((a, b) => a.timestamp - b.timestamp);
      //console.log(base64Img);
      //console.log(imgs);
      //console.log(arr);
      setImgs(arr);

      //console.log(imgs);
      //const arr = imgss.append({"uri": "base64Img"});
      //console.log(arr);
      //const imgDict = imgs.append({uri: base64Img});
      //setImgs(imgDict);
      //const dict = {
      //  uri: base64Img,
      //};
      //imgs.append(dict);
    }
    if (message.destinationName === `katzomat/${name}/feed`) {
      //console.log(message.payloadString);
    }
    if (message.destinationName === `katzomat/${name}/timetable`) {
      console.log(message.payloadString);
      const obj = JSON.parse(message.payloadString);
      const values = obj.values;
      parseTimetable(values);
    }
    if (message.destinationName === `katzomat/${name}/settings`) {
      //console.log(message.payloadString);
    }
  }

  function parseTimetable(values) {
    const arr = [];
    for (let i = 0; i < values.length; i++) {
      let recurring = true;
      let days_count = 0;
      let item_text = '';
      for (let ii = 0; ii < values[i].weekdays.length; ii++) {
        days_count += 1;
        const day = values[i].weekdays[ii];
        if (day === 0) {
          item_text += 'Everyday, ';
        }
        if (day === 1) {
          item_text += 'Sun, ';
        }
        if (day === 2) {
          item_text += 'Mon, ';
        }
        if (day === 3) {
          item_text += 'Tue, ';
        }
        if (day === 4) {
          item_text += 'Wed, ';
        }
        if (day === 5) {
          item_text += 'Thu, ';
        }
        if (day === 6) {
          item_text += 'Fri, ';
        }
        if (day === 7) {
          item_text += 'Sat, ';
        }
      }
      if (days_count === 0) {
        recurring = false;
        const date = new Date(values[i].timestamp * 1000);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDay();
        const hours = date.getHours();
        const minutes = '0' + date.getMinutes();
        const seconds = '0' + date.getSeconds();
        const formattedTime =
          year +
          '-' +
          ('0' + (month + 1)).slice(-2) +
          '-' +
          ('0' + (day + 1)).slice(-2) +
          ',' +
          ('0' + hours).slice(-2) +
          ':' +
          minutes.substr(-2);
        item_text += formattedTime;
        //if (value[i].timestamp < time.now) {
        //  continue;
        //}
      } else {
        const zeroPad = (num, places) => String(num).padStart(places, '0');
        const hour = zeroPad(values[i].hour, 2);
        const minute = zeroPad(values[i].minute, 2);
        item_text += hour + ':' + minute;
      }
      //console.log(item_text, recurring);
      arr.push({
        text: item_text,
        recurring: recurring,
      });
    }
    console.log(arr);
    setTimetable(arr);
  }

  function onConnected(msg) {
    console.log('Connected!!!!');
    setConnected(true);
  }

  function onConnectionLost() {
    setConnected(false);
    console.log('lost Connection!');
  }

  function connect() {
    client.connect({
      useSSL: true,
      userName: name,
      password: 'katz!',
      keepAliveInterval: 2,
      cleanSession: true,
      onSuccess: () => {
        console.log('Connected!');
        client.subscribe(`katzomat/${name}/status`);
        client.subscribe(`katzomat/${name}/status/verbose`);
        client.subscribe(`katzomat/${name}/images/#`);
        client.subscribe(`katzomat/${name}/feed`);
        client.subscribe(`katzomat/${name}/timetable`);
        client.subscribe(`katzomat/${name}/settings`);
        client.onMessageArrived = onMessage;
        client.onConnected = onConnected;
        client.onConnectionLost = onConnectionLost;
      },
      onFailure: () => {
        console.log('Failed to connect!');
      },
    });
  }

  const alert = flag => {
    if (connected === false) {
      connectionAlert();
      return;
    }
    if (
      status === 'Katzomat Status: unkown' ||
      status === 'Katzomat Status: offline'
    ) {
      offlineAlert(flag);
      return;
    }
  };

  const offlineAlert = flag =>
    Alert.alert(
      'Katzomat Offline',
      'The Katzomat will the command as soon it goes online.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Send it anyway', onPress: () => command(flag)},
      ],
    );

  const command = flag => {
    switch (flag) {
      case 'refresh':
        refresh();
        break;
      case 'feed':
        feedAlert();
        break;
      case 'addTimetable':
        addTimetable();
        break;
    }
  };

  const feedAlert = () =>
    Alert.alert('Feed The Cat', 'Do you want to feed the cat?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => feed()},
    ]);

  const connectionAlert = () =>
    Alert.alert('Not connected!', 'Please connect to the KatzoMQTT.', [
      {text: 'Settings', onPress: () => console.log('Go to Settings')},
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => connect()},
    ]);

  function addTimetable() {
    console.log('add timetable');
    setTimetable([{text: 'test'}]);
  }

  function feed() {
    const message = new Paho.Message('0');
    message.destinationName = `katzomat/${name}/feed`;
    client.send(message);
    console.log('sent');
  }

  function refresh() {
    const message = new Paho.Message('0');
    message.destinationName = `katzomat/${name}/images/take`;
    client.send(message);
    console.log('sent');
  }

  return (
    <SafeAreaProvider>
      <PageContextProvider>
        <NavigationContainer>
          {/*<NativeStackExample /> */}
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: 'tomato',
              tabBarInactiveTintColor: 'blue',
            }}>
            <Tab.Screen
              name="HomeTab"
              //component={HomeTabScreen}
              options={{
                tabBarBadge: 3,
                title: 'Home',
                headerTitle: `${status}`,
                tabBarIcon: ({size, color}) => <Icon name={'home'} size={20} />,
              }}>
              {props => (
                <HomeTabScreen
                  {...props}
                  connect={connect}
                  feed={feed}
                  refresh={refresh}
                  imgs={imgs}
                  timetable={timetable}
                  alert={alert}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="Timetable"
              //component={HomeTabScreen}
              options={{
                tabBarBadge: 3,
                title: 'Timetable',
                headerTitle: `${status}`,
                tabBarIcon: ({size, color}) => <Icon name={'home'} size={20} />,
              }}>
              {props => (
                <TimeTabScreen
                  {...props}
                  connect={connect}
                  timetable={timetable}
                  alert={alert}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="SettingsTab"
              //component={SettingsTabScreen}
              options={{
                title: 'Settings',
                headerTitle: `${status}`,
                tabBarIcon: ({size, color}) => (
                  <Icon name={'setting'} size={20} />
                ),
              }}>
              {props => (
                <SettingsTabScreen
                  {...props}
                  connect={connect}
                  timetable={timetable}
                  alert={alert}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      </PageContextProvider>
    </SafeAreaProvider>
  );
};

// interface ChildProps {
//   parentFunction: Function;
// }

function HomeTabScreen(route) {
  const [connected, setConnected] = React.useContext(PageContext);
  const [imgs, setImgs] = React.useContext(PageContext);
  const [imgActive, setimgActive] = useState(0);
  const [imgsLength, setimgsLength] = useState(0);

  //console.log(route);
  React.useLayoutEffect(() => {
    route.navigation.setOptions({
      //headerTitle: `Count is ${status}`, //use this to make the title changeable
      headerRight: () => (
        <Button
          title={connected ? 'Disconnect' : 'Connect'}
          onPress={() => route.connect()}
        />
      ),
    });
  }, [route, route.navigation, connected]); // ← This `connected` here ensures that the header state is updated

  const onchange = nativeEvent => {
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
      );
      //console.log("slide");
      //console.log(slide);
      //console.log(imgActive);
      if (slide !== imgActive) {
        setimgActive(slide);
      }
    }
  };

  function scrollToEndOnNewImg(arrLength) {
    if (this._scrollView) {
      if (arrLength !== imgsLength) {
        setimgsLength(arrLength);
        this._scrollView.scrollToEnd({animated: true});
      } else {
        //this._scrollView.scrollTo({y: imgActive * WIDTH});
      }
    }
  }

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <SafeAreaView style={styles.container}>
        <View style={styles.wrap}>
          <ScrollView
            ref={view => (this._scrollView = view)}
            onScroll={({nativeEvent}) => onchange(nativeEvent)}
            //onScroll={onChange}
            showsHorizontalScrollIndicator={false}
            pagingEnabeled
            horizontal
            style={styles.wrap}>
            {route.imgs.map((e, index) => {
              return (
                <Image
                  key={e.timestamp}
                  resizeMode="contain"
                  style={styles.wrapImg}
                  source={{uri: e.uri}}
                />
              );
            }, scrollToEndOnNewImg(route.imgs.length))}
          </ScrollView>
        </View>
        <View style={styles.wrapDot}>
          {route.imgs.map((e, index) => {
            return (
              <Text
                key={e.timestamp}
                style={imgActive === index ? styles.dotActive : styles.dot}>
                ●
              </Text>
            );
          })}
        </View>
        <View style={styles.wrapDate}>
          <Text>{route.imgs[imgActive].date}</Text>
        </View>
        <View>
          <Button title={'Feed The Cat'} onPress={() => route.alert('feed')} />
        </View>
        <View>
          <Button
            title={'Refresh Image'}
            onPress={() => route.alert('refresh')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function TimeTabScreen(route) {
  const [connected, setConnected] = React.useContext(PageContext);
  const [timetable, setTimetable] = React.useContext(PageContext);
  const [imgActive, setimgActive] = useState(0);
  const [imgsLength, setimgsLength] = useState(0);
  const [modalWeekdaysVisible, setModalWeekdaysVisible] = useState(false);
  const [checked, onChange] = useState({monday: false, tuesday: false});

  const [weekdays, setWeekdays] = useState([]);
  const options = ['Monday', 'Tuesday', 'Wednesday'];

  const [date, setDate] = useState(new Date(1598051730000));
  const [time, setTime] = useState(new Date(1598051730000));
  let showTimePickerAfter = false;
  let mode = '';

  const onDateChange = (event, selectedDate) => {
    console.log(selectedDate);
    const currentDate = selectedDate;
    setDate(currentDate);

    if (showTimePickerAfter) {
      showTimePickerAfter = false;
      showTimepicker();
    }
  };

  const showMode = currentMode => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onDateChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatepicker = boolean => {
    showTimePickerAfter = boolean;
    mode = 'date';
    showMode(mode);
  };

  const showTimepicker = () => {
    mode = 'time';
    showMode(mode);
  };

  React.useLayoutEffect(() => {
    route.navigation.setOptions({
      //headerTitle: `Count is ${status}`, //use this to make the title changeable
      headerRight: () => (
        <Button
          title={connected ? 'Disconnect' : 'Connect'}
          onPress={() => route.connect()}
        />
      ),
    });
  }, [route, route.navigation, connected]); // ← This `connected` here ensures that the header state is updated

  function removeTimetableEntry(index) {
    let arr = route.timetable;
    arr.splice(index, 1);
    if (arr.length === 0) {
      console.log('new');
      arr = [{recurring: false, text: 'No entry'}];
    }
    console.log('func', index, arr);
    setTimetable(arr);
  }

  function pickWeekday(selectedWeekday) {
    //const index = weekdays.findIndex(weekday => weekday === selectedWeekday);

    if (weekdays.includes(selectedWeekday)) {
      setWeekdays(weekdays.filter(weekday => weekday !== selectedWeekday));
      return;
    }

    setWeekdays(weekday => weekdays.concat(selectedWeekday));
    //console.log(weekdays);
  }

  const timetableAlert = () =>
    Alert.alert(
      'Recurring?',
      'Do you want to add a timetable entry that is recurring or just onetime?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Recurring',
          onPress: () => setModalWeekdaysVisible(!modalWeekdaysVisible),
        },
        {text: 'Onetime Only', onPress: () => showTimepicker(true)},
      ],
    );

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <SafeAreaView style={styles.container}>
        <View style={styles.wrap}>
          <ScrollView
            ref={view => (this._scrollView = view)}
            //onScroll={({nativeEvent}) => onchange(nativeEvent)}
            //onScroll={onChange}
            //showsHorizontalScrollIndicator={false}
            pagingEnabeled
            vertical
            style={styles.wrap}>
            {route.timetable.map((e, index) => {
              console.log('view:', e);
              return (
                <View key={index}>
                  <Text>{e.text}</Text>
                  <Button
                    title={'Remove Entry'}
                    onPress={() => removeTimetableEntry(index)}
                  />
                </View>
              );
            })}
          </ScrollView>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalWeekdaysVisible}
            onRequestClose={() => {
              setModalWeekdaysVisible(!modalWeekdaysVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.options}>
                  <Text>Pick your feeding days and time:</Text>
                  {options.map(option => (
                    <View key={option}>
                      <Pressable
                        style={styles.checkBox}
                        onPress={() => pickWeekday(option)}>
                        {weekdays.includes(option) && (
                          <Text style={styles.check}>✓</Text>
                        )}
                      </Pressable>
                      <Text style={styles.weekdayName}>{option}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => showTimepicker()}>
                  <Text>{date.toLocaleTimeString()}</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() =>
                    setModalWeekdaysVisible(!modalWeekdaysVisible)
                  }>
                  <Text style={styles.textStyle}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() =>
                    setModalWeekdaysVisible(!modalWeekdaysVisible)
                  }>
                  <Text style={styles.textStyle}>Ok</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <View>
            <Button
              title={'Add Timetable'}
              //onPress={() => route.alert('addTimetable')}
              onPress={() => timetableAlert()}
            />
            <Text>selected: {date.toDateString()}</Text>
            <Text>selected: {date.toLocaleTimeString()}</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function SettingsTabScreen(route, navigation) {
  const test = React.useContext(PageContext);
  const [connected, setConnected] = React.useContext(PageContext);
  const [name, setName] = React.useContext(PageContext);
  const [password, setPassword] = React.useContext(PageContext);
  const [domain, setDomain] = React.useContext(PageContext);
  //console.log(status);
  React.useEffect(() => {
    route.navigation.setOptions({
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerStyle: {
        backgroundColor: 'red',
      },
      headerRight: () => (
        <Button
          title={connected ? 'Disconnect' : 'Connect'}
          color="black"
          onPress={() => route.connect()}
        />
      ),
    });
  }, [route, route.navigation, connected]);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Settings Tab! </Text>
      <Text>Account Settings: </Text>
      <TextInput
        onChangeText={setDomain}
        value={domain}
        placeholder="Katzapp Domain here"
        keyboardType="url"
      />
      <TextInput
        //onChangeText={setName}
        value={test.name}
        placeholder="Account Name here"
        keyboardType="default"
      />
      <TextInput
        onChangeText={setPassword}
        value={password}
        placeholder="Account password here"
        keyboardType="default"
      />
      <Button
        title={connected ? 'Disconnect' : 'Connect'}
        color="black"
        onPress={() => route.connect()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  check: {
    alignSelf: 'center',
  },
  weekdayName: {
    textTransform: 'capitalize',
    fontSize: 16,
  },
  checkBox: {
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: 'green',
    marginRight: 5,
  },
  weekdays: {
    flexDirection: 'row',
  },
  options: {
    alignSelf: 'flex-start',
    marginLeft: 50,
  },
  container: {
    flex: 1,
  },
  wrap: {
    width: WIDTH,
    height: HEIGHT * 0.5,
  },
  wrapImg: {
    width: WIDTH,
    height: HEIGHT * 0.5,
  },
  wrapDot: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dotActive: {
    margin: 3,
    color: 'black',
  },
  dot: {
    margin: 3,
    color: 'red',
  },
  wrapDate: {
    alignSelf: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

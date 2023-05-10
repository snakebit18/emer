import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { Amplify, Auth, PubSub } from "aws-amplify";
import awsconfig from "./src/aws-exports";
import { withAuthenticator } from "aws-amplify-react-native";
import { AWSIoTProvider } from "@aws-amplify/pubsub";
import { useEffect, useState } from "react";
import Geolocation from "@react-native-community/geolocation";
import haversine from "haversine";
import { CONNECTION_STATE_CHANGE, ConnectionState } from "@aws-amplify/pubsub";
import { Hub } from "aws-amplify";


Amplify.configure({
  ...awsconfig,
  Analytics: {
    disabled: true,
  },
});

Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_region: "ap-south-1",
    aws_pubsub_endpoint:
      "wss://a3f9o2zs6yi85z-ats.iot.ap-south-1.amazonaws.com/mqtt",
  })
);

const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Geolocation Permission",
        message: "Can we access your location?",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    console.log("granted", granted);

    if (granted === "granted") {
      console.log("You can use Geolocation");
      return true;
    } else {
      console.log("You cannot use Geolocation");
      return false;
    }
  } catch (err) {
    return false;
  }
};
 PubSub.subscribe("esp8266/pub",{qos:0}).subscribe({
   next: (data) => console.log("Message received"),
   error: (error) => console.error(error),
   complete: () => console.log("Done"),
 });

 function App() {
  const did = requestLocationPermission();
 const [distance, setDistance] = useState(null);
 const [distance1, setDistance1] = useState(null);
 const [distance2, setDistance2] = useState(null);
 const [finish, setFinish] = useState(null);

// Hub.listen('pubsub', (data) => {
//   const { payload } = data;
//   if (payload.event === CONNECTION_STATE_CHANGE) {r
//     const connectionState = payload.data.connectionState;
//     console.log(connectionState);
//   }
// });

 
  function out() {
    Auth.signOut();
  }
  function t1() {
    PubSub.publish("esp8266/sub", {message:"1"})
      .then(() => console.log("published"))
      .catch((error) => console.error(error));
  }
  function s1() {
    PubSub.publish("esp8266/sub",  {message:"0"})
      .then(() => console.log("published"))
      .catch((error) => console.error(error));
  }
  function t2() {
    PubSub.publish("esp8266_2/sub", {message:"1"})
      .then(() => console.log("published"))
      .catch((error) => console.error(error));
  }
  function s2() {
    PubSub.publish("esp8266_2/sub", {message:"0"})
      .then(() => console.log("published"))
      .catch((error) => console.error(error));
  }
  function t3() {
    PubSub.publish("esp8266_3/sub", {message:"1"})
      .then(() => console.log("published"))
      .catch((error) => console.error(error));
  }
  function s3() {
    PubSub.publish("esp8266_3/sub", {message:"0"})
      .then(() => console.log("published"))
      .catch((error) => console.error(error));
  }
  

useEffect(() => {
  // Set the initial latitude, longitude, and altitude values
  let lat1 = null;
  let lon1 = null;
  let alt1 = null;
  
  const lat=17.669970;
  const lon=75.923397;
  const alt=0;
  // Set the second latitude and longitude values
  const lat2 = 17.6692;
  const lon2 = 75.9222;
  const alt2 = 0;
  var check2=1;
  
  const lat3 = 17.669741;
  const lon3 = 75.923432;
  const alt3 = 0;
  var check3=1;

  
  // Get the current location every second and calculate the distance between two points
  const intervalId = setInterval(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        // Update the latitude, longitude, and altitude values
        lat1 = position.coords.latitude;
        lon1 = position.coords.longitude;
        alt1 = position.coords.altitude;
        // console.log(lat1, lon1, alt1);
        
          const distance = haversine(
            { latitude: lat1, longitude: lon1, altitude: alt1 },
            { latitude: lat, longitude: lon, altitude: alt},
            { unit: "meter" }
          );

            setDistance(distance);
        // Calculate the distance between the two points using geolib
        if (distance<10){
          setFinish('Reached Destination');
        }
        if (check2){
          const distance1 = haversine(
            { latitude: lat1, longitude: lon1, altitude: alt1 },
            { latitude: lat2, longitude: lon2, altitude: alt2 },
            { unit: "meter" }
          );
          setDistance1(distance1);
          console.log("distance1", distance1);
          if (distance1 < 100) {
            if (distance1 < 20) {
              PubSub.publish("esp8266/sub", {message:"0"});
              check2 = false;
            } else {
              PubSub.publish("esp8266/sub", {message:"1"});
            }
          } else {
            PubSub.publish("esp8266/sub", {message:"0"});
          }
        }

        if (check3){
          const distance2 = haversine(
            { latitude: lat1, longitude: lon1, altitude: alt1 },
            { latitude: lat3, longitude: lon3, altitude: alt3 },
            { unit: "meter" }
          );
             setDistance2(distance2);
            console.log("distance2", distance2);
          if (distance2 < 100) {

            if (distance2 < 20) {
              PubSub.publish("esp8266_3/sub", {message:"0"});
              check3 = false;
            } else {
              PubSub.publish("esp8266_3/sub", {message:"1"});
            }
          } else {
            PubSub.publish("esp8266_3/sub", {message:"0"});
          }
        }
        console.log('distance',distance);
        
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, 1000);

}, []);
  

  return (
    <View style={styles.container}>
      <Text>{distance} meters</Text>
      <Text>{distance1} meters</Text>
      <Text>{distance2} meters</Text>
      <Text>{finish}</Text>
      {/* <Button onPress={t1} title="on1" color="green" />
      <Button onPress={s1} title="off1" color="red" /> */}
      {/* <Button onPress={t2} title="on2" color="green" />
      <Button onPress={s2} title="off2" color="red" /> */}
      {/* <Button onPress={t3} title="on3" color="green" />
      <Button onPress={s3} title="off3" color="red" /> */}
      <Button onPress={out} title="out" color="yellow" />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

const signUpConfig = {
  header: "Custom Sign Up",
  hideAllDefaults: true,
  signUpFields: [
    {
      label: "Name",
      key: "name",
      required: true,
      displayOrder: 1,
      type: "string",
    },
    {
      label: "Middle Name",
      key: "middle_name",
      required: true,
      displayOrder: 2,
      type: "string",
    },
    {
      label: "Family Name",
      key: "family_name",
      required: true,
      displayOrder: 3,
      type: "string",
    },
    {
      label: "Username",
      key: "preferred_username",
      required: true,
      displayOrder: 4,
      type: "string",
    },
    {
      label: "email",
      key: "email",
      required: true,
      displayOrder: 5,
      type: "string",
    },
    {
      label: "phone number",
      key: "phone_number",
      required: true,
      displayOrder: 6,
      type: "string",
    },
    {
      label: "password",
      key: "password",
      required: true,
      displayOrder: 7,
      type: "password",
    },
  ],
};

export default withAuthenticator(App, { signUpConfig });

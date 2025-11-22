import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNearbyDevices } from '../hooks/useNearbyDevices';

export default function Discover() {
  const { peers } = useNearbyDevices();
  return (
    <View style={{flex:1,padding:16}}>
      <Text>Nearby</Text>
      <FlatList data={peers} keyExtractor={(i:any)=>i.id} renderItem={({item})=> <Text>{item.name}</Text>} />
    </View>
  );
}

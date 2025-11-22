import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Storage } from '../services/storage';

export default function SavedFriends() {
  const [friends, setFriends] = useState<any[]>([]);
  useEffect(() => {
    (async ()=> {
      const s = await Storage.get('saved_friends') || [];
      setFriends(s);
    })();
  }, []);
  return (
    <View style={{flex:1,padding:16}}>
      <Text>Saved Friends</Text>
      <FlatList data={friends} keyExtractor={(i:any)=>i.id} renderItem={({item})=> <Text>{item.name}</Text>} />
    </View>
  );
}

import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Onboarding({ navigation }: any) {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>Welcome to ShyPal</Text>
      <Button title="Continue" onPress={() => navigation.navigate('Discover')} />
    </View>
  );
}

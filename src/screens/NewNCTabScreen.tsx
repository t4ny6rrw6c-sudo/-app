import React from 'react';
import { useNavigation } from '@react-navigation/native';
import NewNCFormScreen from './NewNCFormScreen';

export default function NewNCTabScreen() {
  const navigation = useNavigation<any>();

  return (
    <NewNCFormScreen
      onSaved={() => {
        navigation.navigate('홈');
      }}
    />
  );
}

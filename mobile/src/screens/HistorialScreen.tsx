import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text } from 'react-native-paper';

export default function HistorialScreen() {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Historial de Viajes</Title>
      <Text style={styles.text}>Aquí verás tu historial de viajes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 10 },
  text: { color: '#666' },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title, Text, Card } from 'react-native-paper';
import { useAppSelector } from '../store/hooks';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { viajeActual } = useAppSelector((state) => state.viajes);

  if (viajeActual) {
    navigation.navigate('ViajeActivo');
    return null;
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Hola, {user?.nombre}! 👋</Title>
      <Text style={styles.subtitle}>¿A dónde quieres ir hoy?</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>🏍️ Solicita tu viaje</Text>
          <Text style={styles.cardText}>Recibe ofertas de conductores cercanos y elige la mejor</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.navigate('SolicitarViaje')} style={styles.cardButton}>Solicitar Viaje</Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>⭐ Calificación: {user?.calificacionPromedio?.toFixed(1) || '5.0'}</Text>
          <Text style={styles.cardText}>Continúa siendo un buen pasajero</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, marginTop: 40, marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  card: { marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardText: { color: '#666' },
  cardButton: { marginTop: 10 },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button, Avatar, Card } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

export default function PerfilScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={user?.nombre?.charAt(0) || 'U'} />
        <Title style={styles.name}>{user?.nombre} {user?.apellidos}</Title>
        <Text style={styles.phone}>{user?.telefono}</Text>
        <Text style={styles.rating}>⭐ {user?.calificacionPromedio?.toFixed(1) || '5.0'}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Tipo de usuario</Text>
          <Text style={styles.value}>{user?.tipoUsuario}</Text>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleLogout} style={styles.button}>Cerrar Sesión</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  name: { fontSize: 24, marginTop: 15 },
  phone: { color: '#666', marginTop: 5 },
  rating: { fontSize: 18, marginTop: 10 },
  card: { marginBottom: 20 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 18, marginTop: 5 },
  button: { marginTop: 20 },
});

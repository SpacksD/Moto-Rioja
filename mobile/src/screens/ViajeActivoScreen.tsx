import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, Title, Text, Card, Chip } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { obtenerOfertasViaje, aceptarOferta } from '../store/slices/ofertasSlice';

export default function ViajeActivoScreen({ navigation }: any) {
  const { viajeActual } = useAppSelector((state) => state.viajes);
  const { ofertas } = useAppSelector((state) => state.ofertas);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (viajeActual) {
      dispatch(obtenerOfertasViaje(viajeActual.id));
    }
  }, [viajeActual]);

  const handleAceptar = async (ofertaId: string) => {
    await dispatch(aceptarOferta(ofertaId));
  };

  if (!viajeActual) {
    navigation.navigate('Home');
    return null;
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Viaje #{viajeActual.codigoViaje}</Title>
      <Text>De: {viajeActual.origenDireccion}</Text>
      <Text>A: {viajeActual.destinoDireccion}</Text>
      <Chip style={styles.chip}>{viajeActual.estado}</Chip>
      
      <Title style={styles.ofertasTitle}>Ofertas Recibidas ({ofertas.length})</Title>
      <FlatList
        data={ofertas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.conductorName}>{item.conductor.usuario.nombre}</Text>
              <Text style={styles.precio}>S/. {item.precioOfertado}</Text>
              {item.mensaje && <Text style={styles.mensaje}>{item.mensaje}</Text>}
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleAceptar(item.id)}>Aceptar</Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Esperando ofertas...</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, marginTop: 20, marginBottom: 10 },
  chip: { marginTop: 10, marginBottom: 20, alignSelf: 'flex-start' },
  ofertasTitle: { fontSize: 20, marginTop: 20, marginBottom: 10 },
  card: { marginBottom: 10 },
  conductorName: { fontSize: 18, fontWeight: 'bold' },
  precio: { fontSize: 24, color: '#2196F3', marginVertical: 5 },
  mensaje: { color: '#666', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});

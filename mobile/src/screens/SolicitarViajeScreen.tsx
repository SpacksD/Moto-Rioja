import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useAppDispatch } from '../store/hooks';
import { solicitarViaje } from '../store/slices/viajesSlice';

export default function SolicitarViajeScreen({ navigation }: any) {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [precio, setPrecio] = useState('');
  const dispatch = useAppDispatch();

  const handleSolicitar = async () => {
    const result = await dispatch(solicitarViaje({
      origen: { latitud: -12.0464, longitud: -77.0428, direccion: origen },
      destino: { latitud: -12.0864, longitud: -77.0528, direccion: destino },
      precioInicial: parseFloat(precio),
      metodoPago: 'efectivo'
    }));
    if (solicitarViaje.fulfilled.match(result)) {
      navigation.navigate('ViajeActivo');
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Solicitar Viaje</Title>
      
      <TextInput label="Origen" value={origen} onChangeText={setOrigen} mode="outlined" style={styles.input} placeholder="Ingresa tu ubicación de origen" />
      <TextInput label="Destino" value={destino} onChangeText={setDestino} mode="outlined" style={styles.input} placeholder="Ingresa tu destino" />
      <TextInput label="Precio inicial (S/.)" value={precio} onChangeText={setPrecio} mode="outlined" keyboardType="numeric" style={styles.input} />
      
      <Button mode="contained" onPress={handleSolicitar} disabled={!origen || !destino || !precio} style={styles.button}>Solicitar Viaje</Button>
      <Button mode="text" onPress={() => navigation.goBack()}>Cancelar</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, marginTop: 40, marginBottom: 30 },
  input: { marginBottom: 15 },
  button: { marginTop: 20, paddingVertical: 6 },
});

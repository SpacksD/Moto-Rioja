import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Title, RadioButton } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register } from '../store/slices/authSlice';

export default function RegisterScreen({ navigation }: any) {
  const [telefono, setTelefono] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('pasajero');
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleRegister = async () => {
    const result = await dispatch(register({ telefono: `+51${telefono}`, nombre, apellidos, tipoUsuario }));
    if (register.fulfilled.match(result)) {
      navigation.navigate('VerifyOtp', { telefono: `+51${telefono}`, isRegistering: true, registerData: { telefono: `+51${telefono}`, nombre, apellidos, tipoUsuario } });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Title style={styles.title}>Crear Cuenta</Title>
      
      <TextInput label="Nombre" value={nombre} onChangeText={setNombre} mode="outlined" style={styles.input} />
      <TextInput label="Apellidos" value={apellidos} onChangeText={setApellidos} mode="outlined" style={styles.input} />
      <TextInput label="Teléfono" value={telefono} onChangeText={setTelefono} mode="outlined" keyboardType="phone-pad" style={styles.input} left={<TextInput.Affix text="+51" />} maxLength={9} />
      
      <Text style={styles.label}>Tipo de usuario:</Text>
      <RadioButton.Group onValueChange={setTipoUsuario} value={tipoUsuario}>
        <View style={styles.radioItem}><RadioButton value="pasajero" /><Text>Pasajero</Text></View>
        <View style={styles.radioItem}><RadioButton value="conductor" /><Text>Conductor</Text></View>
      </RadioButton.Group>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button mode="contained" onPress={handleRegister} loading={isLoading} disabled={!nombre || telefono.length !== 9} style={styles.button}>Registrarse</Button>
      <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.backButton}>Volver al login</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 30 },
  input: { marginBottom: 15 },
  label: { fontSize: 16, marginTop: 10, marginBottom: 10 },
  radioItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  button: { marginTop: 20, paddingVertical: 6 },
  backButton: { marginTop: 10 },
  error: { color: 'red', textAlign: 'center', marginTop: 10 },
});

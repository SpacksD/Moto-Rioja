import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyOtp } from '../store/slices/authSlice';

export default function VerifyOtpScreen({ route }: any) {
  const { telefono, isRegistering, registerData } = route.params;
  const [codigo, setCodigo] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleVerify = async () => {
    await dispatch(verifyOtp({ telefono, codigo, ...(isRegistering && registerData) }));
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Verificar Código</Title>
      <Text style={styles.subtitle}>Ingresa el código de 6 dígitos enviado a {telefono}</Text>
      
      <TextInput label="Código OTP" value={codigo} onChangeText={setCodigo} mode="outlined" keyboardType="number-pad" maxLength={6} style={styles.input} />
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <Button mode="contained" onPress={handleVerify} loading={isLoading} disabled={codigo.length !== 6} style={styles.button}>Verificar</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 30 },
  input: { marginBottom: 20 },
  button: { marginTop: 10, paddingVertical: 6 },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
});

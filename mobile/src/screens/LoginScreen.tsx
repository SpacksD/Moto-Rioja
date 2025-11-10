import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/slices/authSlice';

export default function LoginScreen({ navigation }: any) {
  const [telefono, setTelefono] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    const result = await dispatch(login(telefono));
    if (login.fulfilled.match(result)) {
      navigation.navigate('VerifyOtp', { telefono });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Title style={styles.title}>🏍️ MotoTaxi Connect</Title>
        <Text style={styles.subtitle}>Tu viaje, tu precio</Text>

        <TextInput
          label="Número de teléfono"
          value={telefono}
          onChangeText={setTelefono}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
          left={<TextInput.Affix text="+51" />}
          maxLength={9}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={telefono.length !== 9}
          style={styles.button}
        >
          Continuar
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          style={styles.registerButton}
        >
          ¿No tienes cuenta? Regístrate
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  registerButton: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { auth } from '../../config/firebase';

export default function AuthPage() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [user, loading] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigation.replace('Drawer');
    }
  }, [user]);

  // ✅ Validation helper
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      return Toast.show({ type: 'error', text1: 'Please fill all fields' });
    }
    if (!validateEmail(loginEmail)) {
      return Toast.show({ type: 'error', text1: 'Enter a valid email' });
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setIsLoading(false);
      Toast.show({ type: 'success', text1: 'Login Successful' });
    } catch (error) {
      setIsLoading(false);
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error.message });
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      return Toast.show({ type: 'error', text1: 'Please fill all fields' });
    }
    if (!validateEmail(registerEmail)) {
      return Toast.show({ type: 'error', text1: 'Enter a valid email' });
    }
    if (registerPassword.length < 6) {
      return Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      await updateProfile(userCredential.user, {
        displayName: registerName,
      });
      setIsLoading(false);
      Toast.show({ type: 'success', text1: 'Account Created Successfully' });
    } catch (error) {
      setIsLoading(false);
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: error.message });
    }
  };

  return (
    <LinearGradient
      colors={['#4c6ef5', '#7950f2']}
      style={styles.gradientBackground}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ✅ Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to Intelliger</Text>
        </View>

        {/* ✅ Card Form */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setMode('login')}
              style={[styles.tab, mode === 'login' && styles.activeTab]}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('register')}
              style={[styles.tab, mode === 'register' && styles.activeTab]}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Forms */}
          {mode === 'login' ? (
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="name@example.com"
                style={styles.input}
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="••••••••"
                secureTextEntry
                style={styles.input}
                value={loginPassword}
                onChangeText={setLoginPassword}
              />
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={isLoading}>
                <LinearGradient
                  colors={['#4c6ef5', '#7950f2']}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Sign in</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="John Doe"
                style={styles.input}
                value={registerName}
                onChangeText={setRegisterName}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="name@example.com"
                style={styles.input}
                value={registerEmail}
                onChangeText={setRegisterEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="••••••••"
                secureTextEntry
                style={styles.input}
                value={registerPassword}
                onChangeText={setRegisterPassword}
              />
              <TouchableOpacity onPress={handleRegister} style={styles.button} disabled={isLoading}>
                <LinearGradient
                  colors={['#4c6ef5', '#7950f2']}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Create account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity>
          <Text style={styles.privacyPolicy}>Privacy Policy</Text>
        </TouchableOpacity>

        <Toast />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeTab: {
    backgroundColor: '#e6e9ff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#4c6ef5',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#212529',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ced4da',
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#4c6ef5',
    fontSize: 13,
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  privacyPolicy: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 13,
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
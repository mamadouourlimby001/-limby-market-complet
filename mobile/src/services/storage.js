import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Le token JWT va dans SecureStore (équivalent sécurisé mobile de localStorage.token).
// L'objet user (non sensible) va dans AsyncStorage (équivalent localStorage.user).
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const removeToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

export const getStoredUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const setStoredUser = (user) => AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
export const removeStoredUser = () => AsyncStorage.removeItem(USER_KEY);

// Équivalent localStorage.resetToken (flux mot de passe oublié) — JWT temporaire (15 min),
// stocké dans SecureStore comme le token de session.
const RESET_TOKEN_KEY = 'resetToken';
export const getResetToken = () => SecureStore.getItemAsync(RESET_TOKEN_KEY);
export const setResetToken = (token) => SecureStore.setItemAsync(RESET_TOKEN_KEY, token);
export const removeResetToken = () => SecureStore.deleteItemAsync(RESET_TOKEN_KEY);

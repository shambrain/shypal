import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
  async set(key: string, value: any) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async get(key: string) {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  }
};

// In-memory adapter for tests
export class InMemoryStorage {
  store: Record<string,string> = {};
  async set(key: string, value: any) { this.store[key] = JSON.stringify(value); }
  async get(key: string) { return this.store[key] ? JSON.parse(this.store[key]) : null; }
  async remove(key: string) { delete this.store[key]; }
}

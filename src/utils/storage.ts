import AsyncStorage from '@react-native-async-storage/async-storage';
import { NonConformance } from '../types';

const NC_STORAGE_KEY = '@nonconformances';

export async function saveNC(nc: NonConformance): Promise<void> {
  const existing = await getAllNCs();
  const updated = existing.filter((item) => item.id !== nc.id);
  updated.unshift(nc);
  await AsyncStorage.setItem(NC_STORAGE_KEY, JSON.stringify(updated));
}

export async function getAllNCs(): Promise<NonConformance[]> {
  const data = await AsyncStorage.getItem(NC_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function deleteNC(id: string): Promise<void> {
  const existing = await getAllNCs();
  const updated = existing.filter((item) => item.id !== id);
  await AsyncStorage.setItem(NC_STORAGE_KEY, JSON.stringify(updated));
}

export async function updateNCStatus(
  id: string,
  status: NonConformance['status']
): Promise<void> {
  const existing = await getAllNCs();
  const updated = existing.map((item) =>
    item.id === id ? { ...item, status } : item
  );
  await AsyncStorage.setItem(NC_STORAGE_KEY, JSON.stringify(updated));
}

export function generateId(): string {
  return `NC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

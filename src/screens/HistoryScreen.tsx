import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NonConformance } from '../types';
import { getAllNCs } from '../utils/storage';
import { SEVERITY_COLORS, CATEGORY_LABELS, STATUS_LABELS, INSPECTION_TEMPLATES } from '../data/inspectionTemplates';

export default function HistoryScreen() {
  const [ncs, setNcs] = useState<NonConformance[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getAllNCs();
    setNcs(data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered =
    filter === 'all' ? ncs : ncs.filter((n) => n.status === filter);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.header}>
        <Text style={styles.title}>발행 이력</Text>
        <Text style={styles.subtitle}>총 {ncs.length}건의 부적합 기록</Text>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'open', 'in-progress', 'closed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? '전체' : STATUS_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>기록이 없습니다</Text>
          </View>
        }
        renderItem={({ item }) => {
          const tmpl = INSPECTION_TEMPLATES.find((t) => t.category === item.category);
          const sevColor = SEVERITY_COLORS[item.severity] ?? '#888';
          const ngCount = item.checklistItems.filter((c) => c.result === 'ng').length;
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={[styles.cardId, { color: sevColor }]}>{item.id}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <Text style={styles.cardArea}>{item.inspectionArea}</Text>
              <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.cardCat}>{tmpl?.icon} {CATEGORY_LABELS[item.category]}</Text>
                {ngCount > 0 && (
                  <Text style={styles.cardNg}>❌ 부적합 {ngCount}건</Text>
                )}
                <Text style={styles.cardRecipient}>→ {item.recipientName}</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#FFFFFF' },
  list: { padding: 12 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardId: { fontSize: 11, fontWeight: '700' },
  cardDate: { fontSize: 11, color: '#999' },
  cardArea: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  cardDesc: { fontSize: 12, color: '#666', marginTop: 3 },
  cardBottom: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' },
  cardCat: { fontSize: 11, color: '#555' },
  cardNg: { fontSize: 11, color: '#E74C3C' },
  cardRecipient: { fontSize: 11, color: '#1A56DB', marginLeft: 'auto' },
});

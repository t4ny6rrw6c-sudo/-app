import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NonConformance } from '../types';
import { getAllNCs } from '../utils/storage';
import { CATEGORY_LABELS, SEVERITY_COLORS, STATUS_LABELS, INSPECTION_TEMPLATES } from '../data/inspectionTemplates';
import NCDetailScreen from './NCDetailScreen';

export default function HomeScreen() {
  const [ncs, setNcs] = useState<NonConformance[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<NonConformance | null>(null);

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

  const openCount = ncs.filter((n) => n.status === 'open').length;
  const inProgressCount = ncs.filter((n) => n.status === 'in-progress').length;
  const closedCount = ncs.filter((n) => n.status === 'closed').length;

  if (selected) {
    return (
      <NCDetailScreen
        nc={selected}
        onBack={() => { setSelected(null); load(); }}
        onDeleted={() => { setSelected(null); load(); }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A56DB" />
      <View style={styles.headerBg}>
        <Text style={styles.headerTitle}>현장 부적합 관리</Text>
        <Text style={styles.headerSub}>Field Non-Conformance App</Text>
        <View style={styles.statsRow}>
          <StatCard label="미조치" count={openCount} color="#E74C3C" />
          <StatCard label="조치 중" count={inProgressCount} color="#F39C12" />
          <StatCard label="완료" count={closedCount} color="#27AE60" />
          <StatCard label="전체" count={ncs.length} color="#FFFFFF" />
        </View>
      </View>

      <FlatList
        data={ncs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>부적합 기록이 없습니다</Text>
            <Text style={styles.emptyText}>아래 탭의 "새 부적합" 버튼을 눌러 작성해주세요</Text>
          </View>
        }
        renderItem={({ item }) => {
          const tmpl = INSPECTION_TEMPLATES.find((t) => t.category === item.category);
          const sevColor = SEVERITY_COLORS[item.severity] ?? '#888';
          const statusColor =
            item.status === 'closed' ? '#27AE60' : item.status === 'in-progress' ? '#F39C12' : '#E74C3C';
          return (
            <TouchableOpacity
              style={styles.ncCard}
              onPress={() => setSelected(item)}
              activeOpacity={0.85}
            >
              <View style={[styles.leftBar, { backgroundColor: sevColor }]} />
              <View style={styles.ncContent}>
                <View style={styles.ncTopRow}>
                  <Text style={styles.ncId}>{item.id}</Text>
                  <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusPillText}>{STATUS_LABELS[item.status]}</Text>
                  </View>
                </View>
                <Text style={styles.ncArea}>{item.inspectionArea}</Text>
                <Text style={styles.ncDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.ncBottomRow}>
                  <Text style={styles.ncCat}>{tmpl?.icon} {CATEGORY_LABELS[item.category]}</Text>
                  <Text style={styles.ncDate}>{item.date}</Text>
                </View>
                {item.dueDate && (
                  <Text style={styles.ncDue}>⏰ 조치기한: {item.dueDate}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  headerBg: {
    backgroundColor: '#1A56DB',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statsRow: { flexDirection: 'row', marginTop: 16, gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statCount: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  list: { padding: 12 },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptyText: { fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center' },
  ncCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  leftBar: { width: 5 },
  ncContent: { flex: 1, padding: 14 },
  ncTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ncId: { fontSize: 11, color: '#1A56DB', fontWeight: '700' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusPillText: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  ncArea: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginTop: 4 },
  ncDesc: { fontSize: 12, color: '#555', marginTop: 3, lineHeight: 17 },
  ncBottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  ncCat: { fontSize: 12, color: '#666' },
  ncDate: { fontSize: 12, color: '#999' },
  ncDue: { fontSize: 11, color: '#E74C3C', marginTop: 4 },
});

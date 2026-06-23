import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { INSPECTION_TEMPLATES } from '../data/inspectionTemplates';
import { InspectionTemplate } from '../types';

export default function InspectionSamplesScreen() {
  const [selected, setSelected] = useState<InspectionTemplate | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.header}>
        <Text style={styles.title}>점검 샘플</Text>
        <Text style={styles.subtitle}>
          카테고리를 선택하면 상세 점검 항목을 확인할 수 있습니다
        </Text>
      </View>

      <FlatList
        data={INSPECTION_TEMPLATES}
        keyExtractor={(item) => item.category}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: item.color }]}
            onPress={() => setSelected(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardCount}>{item.items.length}개 항목</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <SafeAreaView style={styles.modalContainer}>
            <View
              style={[styles.modalHeader, { backgroundColor: selected.color }]}
            >
              <Text style={styles.modalIcon}>{selected.icon}</Text>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>{selected.name} 점검</Text>
                <Text style={styles.modalSubtitle}>{selected.description}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelected(null)}
              >
                <Text style={styles.closeBtnText}>닫기</Text>
              </TouchableOpacity>
            </View>

            {selected.legalBasis && (
              <View style={styles.legalBox}>
                <Text style={styles.legalText}>
                  📜 근거: {selected.legalBasis}
                </Text>
              </View>
            )}

            <ScrollView contentContainerStyle={styles.itemList}>
              <Text style={styles.itemListTitle}>
                점검 항목 ({selected.items.length}개)
              </Text>
              {selected.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={[styles.indexBadge, { backgroundColor: selected.color }]}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>💡 점검 TIP</Text>
                <Text style={styles.tipText}>
                  부적합 발행 시 해당 항목을 선택하면 체크리스트로 자동 생성됩니다.
                  새 부적합 탭에서 카테고리를 선택하세요.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  grid: { padding: 10 },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: { fontSize: 28, marginBottom: 6 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  cardCount: { fontSize: 12, color: '#888', marginTop: 2 },
  cardDesc: { fontSize: 11, color: '#666', marginTop: 6, lineHeight: 16 },

  modalContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
  },
  modalIcon: { fontSize: 32, marginRight: 12 },
  modalHeaderText: { flex: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  modalSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  legalBox: {
    backgroundColor: '#EBF5FB',
    margin: 16,
    marginBottom: 0,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498DB',
  },
  legalText: { fontSize: 11, color: '#2980B9', lineHeight: 16 },
  itemList: { padding: 16 },
  itemListTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  indexText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  itemText: { flex: 1, fontSize: 13, color: '#333', lineHeight: 20 },
  tipBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F39C12',
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#E67E22', marginBottom: 4 },
  tipText: { fontSize: 12, color: '#666', lineHeight: 18 },
});

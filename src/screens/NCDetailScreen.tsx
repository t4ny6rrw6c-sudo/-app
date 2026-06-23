import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as SMS from 'expo-sms';
import { NonConformance } from '../types';
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  STATUS_LABELS,
  INSPECTION_TEMPLATES,
} from '../data/inspectionTemplates';
import { buildTextReport, buildHtmlReport } from '../utils/reportUtils';
import { updateNCStatus, deleteNC } from '../utils/storage';

interface Props {
  nc: NonConformance;
  onBack: () => void;
  onDeleted: () => void;
}

export default function NCDetailScreen({ nc, onBack, onDeleted }: Props) {
  const [sending, setSending] = useState(false);
  const severityColor = SEVERITY_COLORS[nc.severity] ?? '#888';
  const template = INSPECTION_TEMPLATES.find((t) => t.category === nc.category);

  const ngCount = nc.checklistItems.filter((i) => i.result === 'ng').length;
  const okCount = nc.checklistItems.filter((i) => i.result === 'ok').length;

  const sendSMS = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('SMS 불가', '이 기기에서는 SMS를 보낼 수 없습니다.');
      return;
    }
    const body = buildTextReport(nc);
    await SMS.sendSMSAsync([nc.recipientPhone], body);
  };

  const sendKakao = async () => {
    const text = buildTextReport(nc);
    const encoded = encodeURIComponent(text);
    const url = `kakaotalk://send?text=${encoded}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        '카카오톡 없음',
        '카카오톡이 설치되어 있지 않습니다. 대신 공유 기능을 사용하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '공유하기', onPress: shareReport },
        ]
      );
    }
  };

  const shareReport = async () => {
    setSending(true);
    try {
      const html = buildHtmlReport(nc);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: '부적합 발행 양식 공유',
      });
    } catch {
      Alert.alert('오류', 'PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('삭제 확인', '이 부적합 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteNC(nc.id);
          onDeleted();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← 목록</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>부적합 상세</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteText}>삭제</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 상단 배지 */}
        <View style={styles.topBadges}>
          <View style={[styles.badge, { backgroundColor: severityColor }]}>
            <Text style={styles.badgeText}>{SEVERITY_LABELS[nc.severity]}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#1A56DB' }]}>
            <Text style={styles.badgeText}>{CATEGORY_LABELS[nc.category]}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: nc.status === 'closed' ? '#27AE60' : nc.status === 'in-progress' ? '#F39C12' : '#E74C3C' },
            ]}
          >
            <Text style={styles.badgeText}>{STATUS_LABELS[nc.status]}</Text>
          </View>
        </View>

        <View style={styles.idRow}>
          <Text style={styles.ncId}>{nc.id}</Text>
          <Text style={styles.ncDate}>{nc.date}</Text>
        </View>

        <View style={styles.card}>
          <Row label="점검 구역" value={nc.inspectionArea} />
          <Row label="점검자" value={nc.inspector} />
          <Row label="조치 기한" value={nc.dueDate || '-'} />
          <Row label="담당자" value={`${nc.recipientName} (${nc.recipientPhone})`} />
        </View>

        <Section title="🔴 부적합 내용">
          <Text style={styles.contentText}>{nc.description || '-'}</Text>
        </Section>

        <Section title="✅ 조치 요청사항">
          <Text style={styles.contentText}>{nc.requiredAction || '-'}</Text>
        </Section>

        {nc.checklistItems.length > 0 && (
          <Section title={`체크리스트 (${template?.name}) — 적합 ${okCount} / 부적합 ${ngCount}`}>
            {nc.checklistItems.map((item) => {
              const mark =
                item.result === 'ok' ? '✅' : item.result === 'ng' ? '❌' : '➖';
              const color =
                item.result === 'ok' ? '#27AE60' : item.result === 'ng' ? '#E74C3C' : '#95A5A6';
              return (
                <View key={item.id} style={styles.checkRow}>
                  <Text style={styles.checkMark}>{mark}</Text>
                  <Text style={[styles.checkText, { color }]}>{item.text}</Text>
                </View>
              );
            })}
          </Section>
        )}

        {nc.photos.length > 0 && (
          <Section title={`📷 현장 사진 (${nc.photos.length})`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {nc.photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          </Section>
        )}

        {nc.location && (
          <Section title="📍 GPS 위치">
            <Text style={styles.gpsText}>
              위도: {nc.location.latitude.toFixed(5)}{'\n'}
              경도: {nc.location.longitude.toFixed(5)}
            </Text>
          </Section>
        )}

        {nc.inspectorSignature && (
          <Section title="✍️ 점검자 서명">
            <Image source={{ uri: nc.inspectorSignature }} style={styles.signatureImg} resizeMode="contain" />
          </Section>
        )}

        {/* 상태 변경 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📌 상태 변경</Text>
        </View>
        <View style={styles.statusRow}>
          {(['open', 'in-progress', 'closed'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusBtn,
                nc.status === s && styles.statusBtnActive,
                nc.status === s && {
                  borderColor: s === 'closed' ? '#27AE60' : s === 'in-progress' ? '#F39C12' : '#E74C3C',
                  backgroundColor: s === 'closed' ? '#EAFAF1' : s === 'in-progress' ? '#FEF9E7' : '#FDEDEC',
                },
              ]}
              onPress={() => updateNCStatus(nc.id, s)}
            >
              <Text style={styles.statusBtnText}>{STATUS_LABELS[s]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 발송 버튼 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📤 담당자 발송</Text>
        </View>
        <View style={styles.sendButtons}>
          <TouchableOpacity style={styles.smsBtn} onPress={sendSMS}>
            <Text style={styles.sendIcon}>💬</Text>
            <Text style={styles.sendText}>SMS 발송</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.kakaoBtn} onPress={sendKakao}>
            <Text style={styles.sendIcon}>💛</Text>
            <Text style={styles.sendText}>카카오톡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pdfBtn} onPress={shareReport} disabled={sending}>
            {sending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.sendIcon}>📄</Text>
                <Text style={styles.sendText}>PDF 공유</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 14, color: '#1A56DB', fontWeight: '600' },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  deleteText: { fontSize: 14, color: '#E74C3C', fontWeight: '600' },
  scroll: { padding: 16 },
  topBadges: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  idRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ncId: { fontSize: 13, fontWeight: '700', color: '#1A56DB' },
  ncDate: { fontSize: 13, color: '#888' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  row: { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  rowLabel: { width: 80, fontSize: 12, color: '#888', fontWeight: '600' },
  rowValue: { flex: 1, fontSize: 13, color: '#1A1A2E' },
  sectionHeader: { marginTop: 4, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  contentText: { fontSize: 14, color: '#333', lineHeight: 22 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  checkMark: { fontSize: 16, marginRight: 8 },
  checkText: { flex: 1, fontSize: 13, lineHeight: 18 },
  photo: { width: 120, height: 90, borderRadius: 8, marginRight: 8 },
  gpsText: { fontSize: 13, color: '#333', lineHeight: 20 },
  signatureImg: { width: '100%', height: 80 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statusBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DDD',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  statusBtnActive: {},
  statusBtnText: { fontSize: 12, fontWeight: '600', color: '#444' },
  sendButtons: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  smsBtn: { flex: 1, backgroundColor: '#27AE60', borderRadius: 12, padding: 14, alignItems: 'center' },
  kakaoBtn: { flex: 1, backgroundColor: '#FEE500', borderRadius: 12, padding: 14, alignItems: 'center' },
  pdfBtn: { flex: 1, backgroundColor: '#E74C3C', borderRadius: 12, padding: 14, alignItems: 'center' },
  sendIcon: { fontSize: 20, marginBottom: 4 },
  sendText: { fontSize: 12, fontWeight: '700', color: '#1A1A2E' },
});

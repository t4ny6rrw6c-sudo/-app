import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { NonConformance, ChecklistItem, InspectionCategory, Severity } from '../types';
import { INSPECTION_TEMPLATES, CATEGORY_LABELS, SEVERITY_LABELS, SEVERITY_COLORS } from '../data/inspectionTemplates';
import { saveNC, generateId } from '../utils/storage';
import SignatureScreen from './SignatureScreen';

interface Props {
  onSaved: () => void;
}

const CATEGORIES: InspectionCategory[] = [
  'scaffold', 'fire', 'confined', 'electrical', 'height', 'equipment',
];
const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];

export default function NewNCFormScreen({ onSaved }: Props) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\. /g, '-').replace('.', '');

  const [date, setDate] = useState(today);
  const [area, setArea] = useState('');
  const [category, setCategory] = useState<InspectionCategory>('scaffold');
  const [inspector, setInspector] = useState('');
  const [description, setDescription] = useState('');
  const [requiredAction, setRequiredAction] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const template = INSPECTION_TEMPLATES.find((t) => t.category === category);
    if (template) {
      setChecklistItems(
        template.items.map((text, i) => ({
          id: `${category}-${i}`,
          text,
          result: 'na' as const,
        }))
      );
    }
  }, [category]);

  const pickImage = async () => {
    if (photos.length >= 5) {
      Alert.alert('알림', '사진은 최대 5장까지 첨부할 수 있습니다.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('알림', '사진은 최대 5장까지 첨부할 수 있습니다.');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch {
      Alert.alert('오류', 'GPS 위치를 가져오지 못했습니다.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const updateChecklist = (id: string, result: ChecklistItem['result']) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, result } : item))
    );
  };

  const handleSave = async () => {
    if (!area.trim()) { Alert.alert('알림', '점검 구역을 입력해주세요.'); return; }
    if (!inspector.trim()) { Alert.alert('알림', '점검자 이름을 입력해주세요.'); return; }
    if (!description.trim()) { Alert.alert('알림', '부적합 내용을 입력해주세요.'); return; }
    if (!recipientName.trim()) { Alert.alert('알림', '담당자 이름을 입력해주세요.'); return; }
    if (!recipientPhone.trim()) { Alert.alert('알림', '담당자 연락처를 입력해주세요.'); return; }

    setSaving(true);
    try {
      const nc: NonConformance = {
        id: generateId(),
        date,
        inspectionArea: area,
        category,
        inspector,
        description,
        requiredAction,
        dueDate,
        severity,
        status: 'open',
        photos,
        location,
        checklistItems,
        recipientName,
        recipientPhone,
        inspectorSignature: signature,
        createdAt: new Date().toISOString(),
      };
      await saveNC(nc);
      Alert.alert('저장 완료', '부적합이 저장되었습니다.', [
        { text: '확인', onPress: onSaved },
      ]);
    } catch {
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const template = INSPECTION_TEMPLATES.find((t) => t.category === category);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* 헤더 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 기본 정보</Text>
        </View>

        <View style={styles.card}>
          <Label text="발행일" />
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

          <Label text="점검 구역 *" />
          <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="예: 3공구 A동 2층" />

          <Label text="점검자 *" />
          <TextInput style={styles.input} value={inspector} onChangeText={setInspector} placeholder="성명을 입력하세요" />
        </View>

        {/* 분류 선택 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏷️ 점검 분류</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CATEGORIES.map((cat) => {
            const tmpl = INSPECTION_TEMPLATES.find((t) => t.category === cat);
            const active = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active && { backgroundColor: tmpl?.color ?? '#1A56DB' }]}
                onPress={() => setCategory(cat)}
              >
                <Text style={styles.chipIcon}>{tmpl?.icon}</Text>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 중요도 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚠️ 중요도</Text>
        </View>
        <View style={styles.severityRow}>
          {SEVERITIES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.severityBtn,
                severity === s && { backgroundColor: SEVERITY_COLORS[s], borderColor: SEVERITY_COLORS[s] },
              ]}
              onPress={() => setSeverity(s)}
            >
              <Text style={[styles.severityText, severity === s && styles.severityTextActive]}>
                {SEVERITY_LABELS[s]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 부적합 내용 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔴 부적합 내용</Text>
        </View>
        <View style={styles.card}>
          <Label text="부적합 내용 *" />
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="부적합 사항을 구체적으로 입력하세요"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Label text="조치 요청사항" />
          <TextInput
            style={[styles.input, styles.multiline]}
            value={requiredAction}
            onChangeText={setRequiredAction}
            placeholder="필요한 조치 사항을 입력하세요"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Label text="조치 기한" />
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* 체크리스트 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            ✅ 체크리스트 ({template?.name})
          </Text>
        </View>
        <View style={styles.card}>
          {checklistItems.map((item) => (
            <View key={item.id} style={styles.checkRow}>
              <Text style={styles.checkText} numberOfLines={2}>{item.text}</Text>
              <View style={styles.checkButtons}>
                {(['ok', 'ng', 'na'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.checkBtn,
                      item.result === r && styles[`check${r.toUpperCase()}` as 'checkOK' | 'checkNG' | 'checkNA'],
                    ]}
                    onPress={() => updateChecklist(item.id, r)}
                  >
                    <Text
                      style={[
                        styles.checkBtnText,
                        item.result === r && styles.checkBtnTextActive,
                      ]}
                    >
                      {r === 'ok' ? '적합' : r === 'ng' ? '부적합' : 'N/A'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* 사진 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📷 현장 사진 ({photos.length}/5)</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Text style={styles.photoBtnIcon}>📷</Text>
              <Text style={styles.photoBtnText}>촬영</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Text style={styles.photoBtnIcon}>🖼️</Text>
              <Text style={styles.photoBtnText}>갤러리</Text>
            </TouchableOpacity>
          </View>
          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoWrapper}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    style={styles.photoDelete}
                    onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <Text style={styles.photoDeleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* GPS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📍 GPS 위치</Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.gpsBtn} onPress={getLocation} disabled={loadingLocation}>
            {loadingLocation ? (
              <ActivityIndicator color="#1A56DB" />
            ) : (
              <Text style={styles.gpsBtnText}>
                {location
                  ? `✅ ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                  : '📍 현재 위치 가져오기'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 서명 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✍️ 점검자 서명</Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.signBtn} onPress={() => setShowSignature(true)}>
            {signature ? (
              <Image source={{ uri: signature }} style={styles.signaturePreview} resizeMode="contain" />
            ) : (
              <Text style={styles.signBtnText}>서명하기</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 담당자 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👤 발송 담당자 정보</Text>
        </View>
        <View style={styles.card}>
          <Label text="담당자 이름 *" />
          <TextInput style={styles.input} value={recipientName} onChangeText={setRecipientName} placeholder="담당자 성명" />

          <Label text="담당자 연락처 *" />
          <TextInput
            style={styles.input}
            value={recipientPhone}
            onChangeText={setRecipientPhone}
            placeholder="010-0000-0000"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>💾 부적합 저장</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={showSignature} animationType="slide">
        <SignatureScreen
          onSave={(sig) => { setSignature(sig); setShowSignature(false); }}
          onCancel={() => setShowSignature(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { padding: 16 },
  sectionHeader: { marginBottom: 8, marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
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
  label: { fontSize: 12, color: '#666', fontWeight: '600', marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1A1A2E',
    backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },
  multiline: { height: 80, textAlignVertical: 'top' },
  chipScroll: { marginBottom: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipIcon: { fontSize: 16, marginRight: 4 },
  chipText: { fontSize: 13, fontWeight: '600', color: '#444' },
  chipTextActive: { color: '#FFFFFF' },
  severityRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  severityBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  severityText: { fontSize: 12, fontWeight: '600', color: '#888' },
  severityTextActive: { color: '#FFFFFF' },
  checkRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 10,
  },
  checkText: { fontSize: 13, color: '#333', marginBottom: 6, lineHeight: 18 },
  checkButtons: { flexDirection: 'row', gap: 6 },
  checkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F5F5F5',
  },
  checkOK: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  checkNG: { backgroundColor: '#E74C3C', borderColor: '#E74C3C' },
  checkNA: { backgroundColor: '#95A5A6', borderColor: '#95A5A6' },
  checkBtnText: { fontSize: 11, fontWeight: '600', color: '#666' },
  checkBtnTextActive: { color: '#FFFFFF' },
  photoButtons: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  photoBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1A56DB',
    borderStyle: 'dashed',
    backgroundColor: '#F0F4FF',
  },
  photoBtnIcon: { fontSize: 22 },
  photoBtnText: { fontSize: 12, color: '#1A56DB', marginTop: 4, fontWeight: '600' },
  photoScroll: { marginTop: 4 },
  photoWrapper: { marginRight: 8, position: 'relative' },
  photoThumb: { width: 80, height: 80, borderRadius: 8 },
  photoDelete: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDeleteText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  gpsBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A56DB',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
  },
  gpsBtnText: { fontSize: 13, color: '#1A56DB', fontWeight: '600' },
  signBtn: {
    height: 100,
    borderWidth: 1.5,
    borderColor: '#1A56DB',
    borderStyle: 'dashed',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FF',
  },
  signBtnText: { color: '#1A56DB', fontSize: 14, fontWeight: '600' },
  signaturePreview: { width: '100%', height: 100 },
  saveButton: {
    backgroundColor: '#1A56DB',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

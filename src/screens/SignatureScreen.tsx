import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';

interface Props {
  onSave: (signature: string) => void;
  onCancel: () => void;
}

export default function SignatureScreen({ onSave, onCancel }: Props) {
  const signatureRef = useRef<any>(null);

  const handleSave = () => {
    if (signatureRef.current) {
      signatureRef.current.readSignature();
    }
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
  };

  const handleOK = (signature: string) => {
    if (!signature || signature === 'data:image/png;base64,') {
      Alert.alert('알림', '서명을 입력해주세요.');
      return;
    }
    onSave(signature);
  };

  const handleEmpty = () => {
    Alert.alert('알림', '서명을 입력해주세요.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>점검자 서명</Text>
        <Text style={styles.subtitle}>아래 서명란에 서명해주세요</Text>
      </View>

      <View style={styles.signatureBox}>
        <SignatureCanvas
          ref={signatureRef}
          onOK={handleOK}
          onEmpty={handleEmpty}
          descriptionText=""
          clearText="지우기"
          confirmText="저장"
          style={styles.canvas}
          backgroundColor="rgba(255,255,255,0)"
          penColor="#1A1A2E"
          webStyle={`.m-signature-pad { box-shadow: none; border: none; }
            .m-signature-pad--body { border: none; }
            .m-signature-pad--footer { display: none; }`}
        />
      </View>
      <Text style={styles.hint}>위 영역에 손가락으로 서명하세요</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearText}>지우기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A2E' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  signatureBox: {
    marginHorizontal: 16,
    height: 250,
    borderWidth: 2,
    borderColor: '#1A56DB',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  canvas: { flex: 1 },
  hint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  cancelText: { color: '#666', fontWeight: '600' },
  clearBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E74C3C',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  clearText: { color: '#E74C3C', fontWeight: '600' },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1A56DB',
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
});

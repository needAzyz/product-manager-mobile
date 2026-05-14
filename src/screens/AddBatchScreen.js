import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { createBatch } from '../api';
import { colors } from '../theme';

export default function AddBatchScreen({ route, navigation }) {
  const { productCode, unite } = route.params;
  const [quantity, setQuantity] = useState('1');
  const [mfgDate, setMfgDate] = useState(formatNow());
  const [expDate, setExpDate] = useState(formatFuture(30));
  const [saving, setSaving] = useState(false);

  function formatNow() {
    const d = new Date();
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function formatFuture(days) {
    const d = new Date(Date.now() + days * 86400000);
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function parseDate(str) {
    // Parse dd/MM/yyyy HH:mm
    const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
    if (!m) return null;
    return new Date(parseInt(m[3]), parseInt(m[2])-1, parseInt(m[1]), parseInt(m[4]), parseInt(m[5]));
  }

  const handleSave = async () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) { Alert.alert('Error', 'Enter a valid quantity'); return; }
    const mfg = parseDate(mfgDate);
    const exp = parseDate(expDate);
    if (!mfg || !exp) { Alert.alert('Error', 'Use format: DD/MM/YYYY HH:MM'); return; }
    if (exp <= mfg) { Alert.alert('Error', 'Expiry must be after manufacture date'); return; }

    setSaving(true);
    try {
      await createBatch({
        product_code: productCode,
        quantity: qty,
        unite: unite || '',
        manufactured_at: mfg.toISOString(),
        expiry_date: exp.toISOString(),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to add batch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>Product: {productCode}</Text>

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input} value={quantity} onChangeText={setQuantity}
          keyboardType="numeric" placeholder="1" placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Manufactured Date (DD/MM/YYYY HH:MM)</Text>
        <TextInput
          style={styles.input} value={mfgDate} onChangeText={setMfgDate}
          placeholder="14/05/2026 01:00" placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Expiry Date (DD/MM/YYYY HH:MM)</Text>
        <TextInput
          style={styles.input} value={expDate} onChangeText={setExpDate}
          placeholder="14/06/2026 01:00" placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Adding...' : 'Add Batch'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20 },
  subtitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 14, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.green, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 28,
  },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});

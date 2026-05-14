import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { createProduct } from '../api';
import { colors } from '../theme';

export default function AddProductScreen({ route, navigation }) {
  const { categories, prefillCode } = route.params || {};
  const [code, setCode] = useState(prefillCode || '');
  const [designation, setDesignation] = useState('');
  const [unite, setUnite] = useState('');
  const [selectedCat, setSelectedCat] = useState(categories?.[0]?.category_id || 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!code.trim() || !designation.trim()) {
      Alert.alert('Erreur', 'Le Code et la Désignation sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      await createProduct({
        code: code.trim(),
        designation: designation.trim(),
        unite: unite.trim(),
        category_id: selectedCat,
      });
      navigation.goBack();
    } catch (e) {
      const msg = e.response?.data?.error || 'Échec de la création du produit';
      Alert.alert('Erreur', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Code</Text>
        <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="Code du produit" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Désignation</Text>
        <TextInput style={styles.input} value={designation} onChangeText={setDesignation} placeholder="Nom du produit" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Unité</Text>
        <TextInput style={styles.input} value={unite} onChangeText={setUnite} placeholder="ex. KG, L, PCS" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.catGrid}>
          {(categories || []).map(c => (
            <TouchableOpacity
              key={c.category_id}
              style={[styles.catOption, selectedCat === c.category_id && styles.catOptionActive]}
              onPress={() => setSelectedCat(c.category_id)}
            >
              <Text style={[styles.catOptionText, selectedCat === c.category_id && styles.catOptionTextActive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Création...' : 'Créer le Produit'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 14, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catOption: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  catOptionActive: { backgroundColor: colors.greenLight, borderColor: colors.green },
  catOptionText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  catOptionTextActive: { color: colors.greenDark, fontWeight: '600' },
  saveBtn: {
    backgroundColor: colors.green, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 28,
  },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});

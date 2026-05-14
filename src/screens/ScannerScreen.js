import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getProduct, getCategories } from '../api';
import { colors } from '../theme';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);

    try {
      // Try to find product by scanned code
      const res = await getProduct(data);
      const product = res.data;
      const catRes = await getCategories();
      const cat = catRes.data.find(c => c.category_id === product.category_id);
      navigation.replace('ProductDetail', { product, catName: cat?.name || '' });
    } catch (e) {
      if (e.response?.status === 404) {
        // Product not found — offer to create
        Alert.alert(
          'Produit Non Trouvé',
          `Aucun produit avec le code "${data}" n'existe. Le créer ?`,
          [
            { text: 'Annuler', onPress: () => { setScanned(false); setProcessing(false); } },
            { text: 'Créer', onPress: async () => {
              const catRes = await getCategories();
              navigation.replace('AddProduct', { categories: catRes.data, prefillCode: data });
            }},
          ]
        );
      } else {
        Alert.alert('Erreur', 'Échec de la recherche du produit');
        setScanned(false);
        setProcessing(false);
      }
    }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator color={colors.green} /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>L'autorisation de l'appareil photo est nécessaire pour scanner les codes-barres</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Accorder l'Autorisation</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'qr', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={styles.hint}>Pointez l'appareil photo vers un code-barres</Text>
      </View>

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.processingText}>Recherche du produit...</Text>
        </View>
      )}

      {scanned && !processing && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
          <Text style={styles.rescanText}>Appuyez pour scanner à nouveau</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, padding: 20 },
  permText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  permBtn: { backgroundColor: colors.green, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  permBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanArea: { width: 250, height: 250, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: colors.green, borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  hint: { color: colors.white, fontSize: 14, marginTop: 20, fontWeight: '500' },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  processingText: { color: colors.white, fontSize: 14, marginTop: 12 },
  rescanBtn: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    backgroundColor: colors.green, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
  },
  rescanText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});

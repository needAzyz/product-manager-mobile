import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBatches, deleteBatch } from '../api';
import { colors, getBatchStatus, getBatchRemaining } from '../theme';

export default function ProductDetailScreen({ route, navigation }) {
  const { product, catName } = route.params;
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBatches = async () => {
    try {
      const res = await getBatches(product.code);
      setBatches(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load batches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchBatches(); }, []));

  const handleDeleteBatch = (id, idx) => {
    Alert.alert('Delete Batch', `Delete batch #${idx + 1}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteBatch(id); fetchBatches(); }
        catch (e) { Alert.alert('Error', 'Failed to delete batch'); }
      }},
    ]);
  };

  const formatDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderBatch = ({ item, index }) => {
    const status = getBatchStatus(item);
    const remaining = getBatchRemaining(item);

    return (
      <View style={styles.batchCard}>
        <View style={styles.batchHeader}>
          <View style={styles.batchNum}>
            <Text style={styles.batchNumText}>#{index + 1}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
            <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.text}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => handleDeleteBatch(item._id, index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${remaining}%`, backgroundColor: status.color }]} />
          </View>
          <Text style={[styles.progressPct, { color: status.color }]}>{remaining}%</Text>
        </View>

        <View style={styles.batchDetails}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>{item.quantity} {item.unite || product.unite}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Manufactured</Text>
            <Text style={styles.detailValue}>{formatDate(item.manufactured_at)}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Expires</Text>
            <Text style={styles.detailValue}>{formatDate(item.expiry_date)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Product info header */}
      <View style={styles.header}>
        <Text style={styles.productName}>{product.designation}</Text>
        <Text style={styles.productCode}>{product.code}</Text>
        <View style={styles.infoRow}>
          {catName ? (
            <View style={styles.catPill}>
              <Text style={styles.catPillText}>{catName}</Text>
            </View>
          ) : null}
          <Text style={styles.infoText}>Unit: {product.unite || '-'}</Text>
          <Text style={styles.infoText}>Batches: {batches.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.green} />
        </View>
      ) : (
        <FlatList
          data={batches}
          keyExtractor={i => i._id}
          renderItem={renderBatch}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBatches(); }} tintColor={colors.green} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No batches yet</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('AddBatch', { productCode: product.code, unite: product.unite })}
      >
        <Text style={styles.addBtnText}>+ Add Batch</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: colors.white, padding: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  productName: { fontSize: 18, fontWeight: '700', color: colors.text },
  productCode: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  catPill: { backgroundColor: colors.greenLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  catPillText: { fontSize: 11, fontWeight: '600', color: colors.greenDark },
  infoText: { fontSize: 12, color: colors.textSecondary },
  list: { padding: 16, paddingBottom: 80 },
  batchCard: {
    backgroundColor: colors.white, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: colors.borderLight,
  },
  batchHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  batchNum: { backgroundColor: colors.borderLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  batchNumText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: '600' },
  deleteText: { fontSize: 12, color: colors.red, fontWeight: '500' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  progressBg: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  progressPct: { fontSize: 10, fontWeight: '600', marginLeft: 8, width: 32 },
  batchDetails: { flexDirection: 'row', marginTop: 10, gap: 12 },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '500', textTransform: 'uppercase' },
  detailValue: { fontSize: 12, color: colors.text, fontWeight: '500', marginTop: 2 },
  emptyText: { textAlign: 'center', color: colors.textMuted, fontSize: 14, paddingTop: 40 },
  addBtn: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: colors.green, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  addBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});

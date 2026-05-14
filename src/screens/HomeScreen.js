import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, getCategories, deleteProduct } from '../api';
import { colors, getCategoryColor, getStatusColor, getStatusText } from '../theme';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const filtered = products.filter(p => {
    if (selectedCategory !== -1 && p.category_id !== selectedCategory) return false;
    if (search && !p.designation.toLowerCase().includes(search.toLowerCase())
        && !p.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getCatName = (id) => {
    const cat = categories.find(c => c.category_id === id);
    return cat ? cat.name : '';
  };

  const handleDelete = (code, name) => {
    Alert.alert('Delete Product', `Delete "${name}" and all its batches?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteProduct(code); fetchData(); }
        catch (e) { Alert.alert('Error', 'Failed to delete'); }
      }},
    ]);
  };

  const renderProduct = ({ item }) => {
    const statusColor = getStatusColor(item);
    const statusText = getStatusText(item);
    const catColor = getCategoryColor(item.category_id);
    const catName = getCatName(item.category_id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { product: item, catName })}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.productName} numberOfLines={1}>{item.designation}</Text>
            <Text style={styles.productCode}>{item.code}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.code, item.designation)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardBottom}>
          {catName ? (
            <View style={[styles.catPill, { backgroundColor: catColor + '20' }]}>
              <Text style={[styles.catText, { color: catColor }]}>{catName}</Text>
            </View>
          ) : null}
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Batches</Text>
            <Text style={styles.statValue}>{item.batch_count}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Qty</Text>
            <Text style={styles.statValue}>{item.total_quantity}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        {item.batch_count > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, {
                width: `${item.min_remaining_life}%`,
                backgroundColor: statusColor
              }]} />
            </View>
            <Text style={[styles.progressText, { color: statusColor }]}>{item.min_remaining_life}%</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={[{ category_id: -1, name: 'All' }, ...categories]}
        keyExtractor={i => String(i.category_id)}
        showsHorizontalScrollIndicator={false}
        style={styles.catFilter}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, selectedCategory === item.category_id && styles.catChipActive]}
            onPress={() => setSelectedCategory(item.category_id)}
          >
            <Text style={[styles.catChipText, selectedCategory === item.category_id && styles.catChipTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* KPI Row */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { borderLeftColor: colors.blue }]}>
          <Text style={styles.kpiValue}>{products.length}</Text>
          <Text style={styles.kpiLabel}>Total</Text>
        </View>
        <View style={[styles.kpi, { borderLeftColor: colors.green }]}>
          <Text style={styles.kpiValue}>{products.filter(p => p.fresh_count > 0 && p.expired_count === 0 && p.expiring_count === 0).length}</Text>
          <Text style={styles.kpiLabel}>Fresh</Text>
        </View>
        <View style={[styles.kpi, { borderLeftColor: colors.yellow }]}>
          <Text style={styles.kpiValue}>{products.filter(p => p.expiring_count > 0).length}</Text>
          <Text style={styles.kpiLabel}>Expiring</Text>
        </View>
        <View style={[styles.kpi, { borderLeftColor: colors.red }]}>
          <Text style={styles.kpiValue}>{products.filter(p => p.expired_count > 0).length}</Text>
          <Text style={styles.kpiLabel}>Expired</Text>
        </View>
      </View>

      {/* Product list */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.code}
        renderItem={renderProduct}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
      />

      {/* FABs */}
      <TouchableOpacity style={styles.scanFab} onPress={() => navigation.navigate('Scanner')}>
        <Text style={styles.fabText}>📷</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addFab} onPress={() => navigation.navigate('AddProduct', { categories })}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  loadingText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
  searchRow: { paddingHorizontal: 16, paddingTop: 12 },
  searchInput: {
    backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  catFilter: { maxHeight: 44, paddingLeft: 16, marginTop: 10 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: colors.greenLight, borderColor: colors.green },
  catChipText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  catChipTextActive: { color: colors.greenDark, fontWeight: '600' },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  kpi: {
    flex: 1, backgroundColor: colors.white, borderRadius: 10, padding: 10,
    borderLeftWidth: 3, alignItems: 'center',
  },
  kpiValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  kpiLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  card: {
    backgroundColor: colors.white, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: colors.borderLight,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  productName: { fontSize: 14, fontWeight: '600', color: colors.text },
  productCode: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  deleteText: { fontSize: 16, color: colors.textMuted, padding: 4 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8, flexWrap: 'wrap' },
  catPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  catText: { fontSize: 10, fontWeight: '500' },
  stat: { alignItems: 'center', marginHorizontal: 4 },
  statLabel: { fontSize: 9, color: colors.textMuted },
  statValue: { fontSize: 12, fontWeight: '600', color: colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '600' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressBg: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 10, fontWeight: '600', marginLeft: 8, width: 32 },
  emptyText: { textAlign: 'center', color: colors.textMuted, fontSize: 14, paddingTop: 40 },
  addFab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.green,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  scanFab: {
    position: 'absolute', bottom: 24, right: 88,
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.blue,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  fabText: { fontSize: 24, color: colors.white, fontWeight: '600' },
});

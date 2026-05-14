import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, getCategories, deleteProduct } from '../api';
import { colors, getCategoryColor, getStatusColor, getStatusText } from '../theme';

// ─────────────────────────────────────────────────────
//  Pure-View icon primitives  (no emoji, no icon libs)
// ─────────────────────────────────────────────────────

/** iOS-style "+" */
function PlusIcon({ size = 20, color = '#fff' }) {
  const half = size / 2;
  const arm = 1.5; // half-thickness of each arm
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        position: 'absolute',
        width: size, height: arm * 2,
        backgroundColor: color, borderRadius: arm,
      }} />
      <View style={{
        position: 'absolute',
        width: arm * 2, height: size,
        backgroundColor: color, borderRadius: arm,
      }} />
    </View>
  );
}

/** Viewfinder / barcode scan icon */
function ScanIcon({ size = 22, color = '#fff' }) {
  const cs = size * 0.32;   // corner segment length
  const t  = size * 0.07;   // stroke thickness
  const r  = size * 0.12;   // corner radius

  const cornerStyle = (pos) => [{ position: 'absolute', width: cs, height: cs, borderColor: color }, pos];

  return (
    <View style={{ width: size, height: size }}>
      {/* corners */}
      <View style={[...cornerStyle({ top: 0, left: 0 }), { borderTopWidth: t, borderLeftWidth: t, borderTopLeftRadius: r }]} />
      <View style={[...cornerStyle({ top: 0, right: 0 }), { borderTopWidth: t, borderRightWidth: t, borderTopRightRadius: r }]} />
      <View style={[...cornerStyle({ bottom: 0, left: 0 }), { borderBottomWidth: t, borderLeftWidth: t, borderBottomLeftRadius: r }]} />
      <View style={[...cornerStyle({ bottom: 0, right: 0 }), { borderBottomWidth: t, borderRightWidth: t, borderBottomRightRadius: r }]} />
      {/* center scan line */}
      <View style={{
        position: 'absolute',
        top: size / 2 - t / 2,
        left: size * 0.2, right: size * 0.2,
        height: t * 1.1,
        backgroundColor: color, borderRadius: t,
      }} />
    </View>
  );
}

/** Magnifying glass */
function SearchIcon({ size = 16, color = '#94A3B8' }) {
  const circleSize = size * 0.72;
  const t = size * 0.12;
  const handleLen = size * 0.28;
  return (
    <View style={{ width: size, height: size }}>
      <View style={{
        position: 'absolute', top: 0, left: 0,
        width: circleSize, height: circleSize,
        borderRadius: circleSize / 2,
        borderWidth: t, borderColor: color,
      }} />
      <View style={{
        position: 'absolute',
        bottom: 0, right: 0,
        width: t * 1.2, height: handleLen,
        backgroundColor: color,
        borderRadius: t,
        transform: [{ rotate: '-45deg' }, { translateX: -2 }, { translateY: -2 }],
      }} />
    </View>
  );
}

// ─────────────────────────────────────────────────────

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
      Alert.alert('Erreur', 'Échec du chargement des données');
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
    Alert.alert('Supprimer le Produit', `Supprimer "${name}" et tous ses lots ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try { await deleteProduct(code); fetchData(); }
          catch (e) { Alert.alert('Erreur', 'Échec de la suppression'); }
        },
      },
    ]);
  };

  const renderProduct = ({ item }) => {
    const statusColor = getStatusColor(item);
    const statusText  = getStatusText(item);
    const catColor    = getCategoryColor(item.category_id);
    const catName     = getCatName(item.category_id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { product: item, catName })}
        activeOpacity={0.55}
      >
        {/* Left status stripe */}
        <View style={[styles.cardStripe, { backgroundColor: statusColor }]} />

        <View style={styles.cardBody}>
          {/* Row 1: name + delete */}
          <View style={styles.cardRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.productName} numberOfLines={1}>{item.designation}</Text>
              <Text style={styles.productCode}>{item.code}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item.code, item.designation)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          {item.batch_count > 0 && (
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {
                  width: `${Math.max(0, Math.min(100, item.min_remaining_life))}%`,
                  backgroundColor: statusColor,
                }]} />
              </View>
              <Text style={[styles.progressPct, { color: statusColor }]}>
                {item.min_remaining_life}%
              </Text>
            </View>
          )}

          {/* Row 2: category + stats + status badge */}
          <View style={styles.cardMeta}>
            {catName ? (
              <View style={[styles.catPill, { backgroundColor: catColor + '1A' }]}>
                <Text style={[styles.catPillText, { color: catColor }]}>{catName}</Text>
              </View>
            ) : null}

            <View style={styles.metaRight}>
              <Text style={styles.statText}>
                <Text style={styles.statValue}>{item.batch_count}</Text>
                <Text style={styles.statUnit}> lots</Text>
              </Text>
              <View style={styles.dot} />
              <Text style={styles.statText}>
                <Text style={styles.statValue}>{item.total_quantity}</Text>
                <Text style={styles.statUnit}> unités</Text>
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  const freshCount    = products.filter(p => p.fresh_count > 0 && p.expired_count === 0 && p.expiring_count === 0).length;
  const expiringCount = products.filter(p => p.expiring_count > 0).length;
  const expiredCount  = products.filter(p => p.expired_count > 0).length;

  return (
    <View style={styles.container}>

      {/* ── Search bar ── */}
      <View style={styles.searchWrap}>
        <SearchIcon size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* ── Category chips ── */}
      <FlatList
        horizontal
        data={[{ category_id: -1, name: 'Tout' }, ...categories]}
        keyExtractor={i => String(i.category_id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipListContent}
        style={styles.chipList}
        renderItem={({ item }) => {
          const active = selectedCategory === item.category_id;
          return (
            <TouchableOpacity
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSelectedCategory(item.category_id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── KPI strip ── */}
      <View style={styles.kpiStrip}>
        {[
          { value: products.length, label: 'Total',   color: colors.blue },
          { value: freshCount,      label: 'Frais',   color: colors.green },
          { value: expiringCount,   label: 'Bientôt', color: colors.yellow },
          { value: expiredCount,    label: 'Expiré',  color: colors.red },
        ].map(({ value, label, color }, idx) => (
          <View key={label} style={[styles.kpiCell, idx > 0 && styles.kpiCellBorder]}>
            <Text style={[styles.kpiNum, { color }]}>{value}</Text>
            <Text style={styles.kpiLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ── Product list ── */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.code}
        renderItem={renderProduct}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconBox}>
              <View style={styles.emptyIconLine} />
              <View style={[styles.emptyIconLine, { width: 28, marginTop: 5 }]} />
              <View style={[styles.emptyIconLine, { width: 20, marginTop: 5 }]} />
            </View>
            <Text style={styles.emptyTitle}>Aucun produit</Text>
            <Text style={styles.emptySubtitle}>Ajoutez un produit avec le bouton +</Text>
          </View>
        }
      />

      {/* ── Bottom toolbar (iOS-style) ── */}
      <View style={styles.toolbar}>
        {/* Scanner button */}
        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.6}
        >
          <ScanIcon size={24} color={colors.blue} />
          <Text style={[styles.toolbarLabel, { color: colors.blue }]}>Scanner</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.toolbarDivider} />

        {/* Add product button */}
        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={() => navigation.navigate('AddProduct', { categories })}
          activeOpacity={0.6}
        >
          <View style={styles.addIconWrap}>
            <PlusIcon size={16} color="#fff" />
          </View>
          <Text style={[styles.toolbarLabel, { color: colors.green }]}>Nouveau</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  loadingText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },

  // ── Search ──────────────────────────────────
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 12, marginBottom: 0,
    backgroundColor: '#ECEEF2',
    borderRadius: 12,
    paddingHorizontal: 11, height: 38,
    gap: 7,
  },
  searchInput: {
    flex: 1, fontSize: 15, color: colors.text,
    letterSpacing: -0.2, paddingVertical: 0,
  },

  // ── Category chips ───────────────────────────
  chipList: { flexGrow: 0, marginTop: 11 },
  chipListContent: { paddingHorizontal: 16, gap: 7 },
  chip: {
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  chipActive: { backgroundColor: colors.greenLight, borderColor: colors.green },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, letterSpacing: -0.1 },
  chipTextActive: { color: colors.greenDark, fontWeight: '600' },

  // ── KPI strip ───────────────────────────────
  kpiStrip: {
    flexDirection: 'row',
    marginHorizontal: 16, marginTop: 13,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  kpiCell: {
    flex: 1, alignItems: 'center', paddingVertical: 11,
  },
  kpiCellBorder: {
    borderLeftWidth: 1, borderLeftColor: colors.borderLight,
  },
  kpiNum: { fontSize: 21, fontWeight: '700', letterSpacing: -0.6, lineHeight: 25 },
  kpiLabel: { fontSize: 10.5, color: colors.textMuted, fontWeight: '500', marginTop: 2, letterSpacing: 0.1 },

  // ── Product list ─────────────────────────────
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 96 },

  // ── Product card ─────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1, borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  cardStripe: { width: 3 },
  cardBody: { flex: 1, paddingHorizontal: 13, paddingVertical: 11 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },

  productName: {
    fontSize: 15, fontWeight: '600',
    color: colors.text, letterSpacing: -0.3, lineHeight: 20,
  },
  productCode: {
    fontSize: 11.5, color: colors.textMuted,
    marginTop: 1, letterSpacing: 0.1,
  },

  deleteBtn: { padding: 2, marginTop: 1 },
  deleteBtnText: { fontSize: 13, color: colors.border, fontWeight: '400' },

  // Progress
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressTrack: {
    flex: 1, height: 3, backgroundColor: colors.borderLight,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: 3, borderRadius: 2 },
  progressPct: {
    fontSize: 10, fontWeight: '600',
    marginLeft: 7, width: 28, textAlign: 'right', letterSpacing: -0.1,
  },

  // Meta row
  cardMeta: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, flexWrap: 'wrap', gap: 5,
  },
  catPill: { paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 7 },
  catPillText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },

  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  statText: { fontSize: 12 },
  statValue: { fontWeight: '600', color: colors.text },
  statUnit: { color: colors.textMuted },
  dot: { width: 2.5, height: 2.5, borderRadius: 1.5, backgroundColor: colors.border },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 7 },
  statusBadgeText: { fontSize: 11, fontWeight: '600', letterSpacing: -0.1 },

  // ── Empty state ──────────────────────────────
  emptyWrap: { alignItems: 'center', paddingTop: 64 },
  emptyIconBox: { marginBottom: 16, alignItems: 'flex-start' },
  emptyIconLine: {
    width: 36, height: 3, backgroundColor: colors.borderLight,
    borderRadius: 2,
  },
  emptyTitle: {
    fontSize: 16, fontWeight: '600', color: colors.text, letterSpacing: -0.3,
  },
  emptySubtitle: {
    marginTop: 5, fontSize: 13, color: colors.textMuted, letterSpacing: -0.1,
  },

  // ── Bottom toolbar ───────────────────────────
  toolbar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 0.5, borderTopColor: colors.border,
    paddingBottom: 28,   // safe area / home indicator
    paddingTop: 10,
    // iOS blur-like effect via semi-transparency
  },
  toolbarBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 4,
  },
  toolbarDivider: {
    width: 1, height: 32, backgroundColor: colors.borderLight,
  },
  toolbarLabel: {
    fontSize: 11, fontWeight: '500', letterSpacing: -0.1,
  },
  addIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.green,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
});

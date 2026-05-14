import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🌿</Text>
        <Text style={styles.title}>Product Manager</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.desc}>
          A modern inventory management app for tracking products, batches, shelf life, and expiration dates.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.creditLabel}>Developed by</Text>
        <Text style={styles.creditName}>Azyz Bouraoui</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/needAzyz')}>
          <Text style={styles.link}>github.com/needAzyz</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <Text style={styles.creditLabel}>App Owner</Text>
        <Text style={styles.creditName}>Doua Rouissi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: colors.white, borderRadius: 20, padding: 32,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  icon: { fontSize: 48 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12 },
  version: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  desc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 16, lineHeight: 20 },
  divider: { height: 1, backgroundColor: colors.border, alignSelf: 'stretch', marginVertical: 20 },
  creditLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  creditName: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 4 },
  link: { fontSize: 13, color: colors.blue, marginTop: 4 },
  spacer: { height: 16 },
});

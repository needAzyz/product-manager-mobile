import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {/* Logo */}
        <Image
          source={require('../../assets/applogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Surveille Garde</Text>
        <Text style={styles.version}>Version 2.0.1</Text>

        <Text style={styles.desc}>
          Application de gestion des stocks et de surveillance des dates d'expiration
          pour l'hôtel Dar Ismail Tabarka.
        </Text>

        {/* Owner / Main Developer */}
        <Text style={styles.sectionLabel}>Développée par</Text>
        <Text style={styles.personName}>Douaa Rouissi</Text>
        <Text style={styles.hotelTag}>Pour l'Hôtel Dar Ismail Tabarka</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/rouissidouaa0')}>
          <Text style={styles.link}>@rouissidouaa0</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        {/* Contributor */}
        <Text style={styles.sectionLabel}>Avec l'aide de</Text>
        <Text style={styles.personName}>Azyz Bouraoui</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/needAzyz')}>
          <Text style={styles.link}>@needAzyz</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    justifyContent: 'center', padding: 24,
  },
  card: {
    backgroundColor: colors.white, borderRadius: 20, padding: 32,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  logo: {
    width: 80, height: 80, borderRadius: 18, marginBottom: 4,
  },
  title: {
    fontSize: 22, fontWeight: '700', color: colors.text,
    marginTop: 12, letterSpacing: -0.4,
  },
  version: {
    fontSize: 12, color: colors.textMuted, marginTop: 4, letterSpacing: 0.2,
  },
  desc: {
    fontSize: 13, color: colors.textSecondary, textAlign: 'center',
    marginTop: 14, lineHeight: 20,
  },
  divider: {
    height: 1, backgroundColor: colors.border,
    alignSelf: 'stretch', marginVertical: 20,
  },
  sectionLabel: {
    fontSize: 10, color: colors.textMuted, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4,
  },
  personName: {
    fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2,
  },
  hotelTag: {
    fontSize: 12, color: colors.textSecondary, marginTop: 2,
  },
  link: {
    fontSize: 13, color: colors.blue, marginTop: 4,
  },
  spacer: { height: 20 },
});

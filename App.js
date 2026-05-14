import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import AddBatchScreen from './src/screens/AddBatchScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import AboutScreen from './src/screens/AboutScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#FFFFFF' },
  headerTintColor: '#0F172A',
  headerTitleStyle: { fontWeight: '600', fontSize: 17, letterSpacing: -0.3 },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: '#F6F8FB' },
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Surveille Garde',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('About')}
                style={{ paddingHorizontal: 4 }}
              >
                <Text style={{ fontSize: 15, color: '#3B82F6', fontWeight: '500' }}>
                  À propos
                </Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Lots' }} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Nouveau Produit' }} />
        <Stack.Screen name="AddBatch" component={AddBatchScreen} options={{ title: 'Ajouter un Lot' }} />
        <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scanner le Code-barres', headerShown: false }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'À propos' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

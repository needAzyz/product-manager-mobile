import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
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
  headerTitleStyle: { fontWeight: '600', fontSize: 16 },
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
            title: '🌿 Product Manager',
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('About')} style={{ paddingHorizontal: 8 }}>
                <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>About</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Batches' }} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'New Product' }} />
        <Stack.Screen name="AddBatch" component={AddBatchScreen} options={{ title: 'Add Batch' }} />
        <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scan Barcode', headerShown: false }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

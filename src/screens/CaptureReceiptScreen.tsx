import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeReceiptImage } from '../services/geminiService';
import { saveReceipt } from '../services/receiptService';
import { saveImagePermanently } from '../utils/fileSystem';

export default function CaptureReceiptScreen({ navigation }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para capturar cupons.');
      return false;
    }
    return true;
  };

  const takePicture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setExtractedData(null);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setExtractedData(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      // Convert image to base64
      const response = await fetch(image);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];

        try {
          const data = await analyzeReceiptImage(base64data);
          setExtractedData(data);
          Alert.alert('Sucesso!', 'Cupom analisado com sucesso!');
        } catch (error) {
          console.error('Error analyzing:', error);
          Alert.alert('Erro', 'Falha ao analisar o cupom. Tente novamente.');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Erro', 'Falha ao processar a imagem.');
      setLoading(false);
    }
  };

  const saveReceiptData = async () => {
    if (!image || !extractedData) return;

    setLoading(true);
    try {
      console.log('💾 [Save] Starting save process...');
      console.log('💾 [Save] Image URI:', image);

      // Copia imagem do cache temporário para diretório permanente
      console.log('💾 [Save] Saving image permanently...');
      const permanentUri = await saveImagePermanently(image);
      console.log('💾 [Save] Permanent URI:', permanentUri);

      // Salva cupom com URI permanente
      console.log('💾 [Save] Saving to Firestore...');
      await saveReceipt(permanentUri, extractedData);
      console.log('✅ [Save] Receipt saved successfully!');

      Alert.alert('Sucesso!', 'Cupom salvo com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            setImage(null);
            setExtractedData(null);
            navigation.navigate('Receipts');
          },
        },
      ]);
    } catch (error) {
      console.error('❌ [Save] Error saving:', error);
      Alert.alert(
        'Erro',
        `Falha ao salvar o cupom.\n\nDetalhes: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Capturar Cupom Fiscal</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.buttonText}>📷 Tirar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>🖼️ Escolher da Galeria</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />

          {!extractedData && (
            <TouchableOpacity
              style={[styles.button, styles.analyzeButton]}
              onPress={analyzeImage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>🤖 Analisar com IA</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {extractedData && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Dados Extraídos:</Text>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Estabelecimento:</Text>
            <Text style={styles.dataValue}>{extractedData.storeName}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Valor Total:</Text>
            <Text style={styles.dataValue}>
              R$ {extractedData.totalAmount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Data:</Text>
            <Text style={styles.dataValue}>{extractedData.date}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Hora:</Text>
            <Text style={styles.dataValue}>{extractedData.time}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Categoria:</Text>
            <Text style={styles.dataValue}>{extractedData.category}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveReceiptData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>💾 Salvar Cupom</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  button: {
    backgroundColor: '#6366F1',
    padding: 18,
    borderRadius: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  image: {
    width: '100%',
    height: 420,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  analyzeButton: {
    backgroundColor: '#14B8A6',
    width: '100%',
    shadowColor: '#14B8A6',
  },
  dataContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  dataTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    color: '#1E293B',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dataLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    marginTop: 20,
    shadowColor: '#F59E0B',
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getReceipts, deleteReceipt } from '../services/receiptService';
import { deleteImage } from '../utils/fileSystem';
import { Receipt } from '../types';

export default function ReceiptsListScreen({ navigation }: any) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error('Error loading receipts:', error);
      Alert.alert('Erro', 'Falha ao carregar cupons.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [])
  );

  const handleDelete = async (id: string, imageUri: string) => {
    console.log('🗑️ [UI] Delete button pressed');
    console.log('🗑️ [UI] Receipt ID:', id);
    console.log('🗑️ [UI] Image URI:', imageUri);

    // Função auxiliar para executar a deleção
    const performDelete = async () => {
      try {
        console.log('🗑️ [UI] User confirmed deletion');

        console.log('🗑️ [UI] Step 1: Deleting from Firestore...');
        await deleteReceipt(id);
        console.log('✅ [UI] Step 1 complete: Firestore deletion successful');

        console.log('🗑️ [UI] Step 2: Deleting image from storage...');
        try {
          await deleteImage(imageUri);
          console.log('✅ [UI] Step 2 complete: Image deletion successful');
        } catch (imgError) {
          console.warn('⚠️ [UI] Step 2 warning: Failed to delete image:', imgError);
        }

        console.log('🗑️ [UI] Step 3: Reloading receipts list...');
        await loadReceipts();
        console.log('✅ [UI] Step 3 complete: List reloaded');

        // Mostrar mensagem de sucesso
        if (Platform.OS === 'web') {
          alert('Cupom excluído com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Cupom excluído com sucesso!');
        }
        console.log('✅ [UI] Delete operation completed successfully');
      } catch (error) {
        console.error('❌ [UI] Delete operation failed:', error);
        console.error('❌ [UI] Error details:', JSON.stringify(error, null, 2));

        // Mostrar mensagem de erro
        if (Platform.OS === 'web') {
          alert(`Falha ao excluir cupom: ${error}`);
        } else {
          Alert.alert('Erro', `Falha ao excluir cupom: ${error}`);
        }
      }
    };

    // Usar confirmação apropriada para cada plataforma
    if (Platform.OS === 'web') {
      // Web: usar window.confirm nativo
      console.log('🗑️ [UI] Showing web confirmation dialog...');
      const confirmed = window.confirm('Deseja realmente excluir este cupom?');
      console.log('🗑️ [UI] User response:', confirmed ? 'Confirmed' : 'Cancelled');

      if (confirmed) {
        await performDelete();
      } else {
        console.log('🗑️ [UI] Delete cancelled by user');
      }
    } else {
      // Mobile: usar Alert.alert do React Native
      Alert.alert('Confirmar', 'Deseja realmente excluir este cupom?', [
        { text: 'Cancelar', style: 'cancel', onPress: () => console.log('🗑️ [UI] Delete cancelled by user') },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: performDelete,
        },
      ]);
    }
  };

  const handleImageError = (receiptId: string) => {
    setFailedImages(prev => new Set(prev).add(receiptId));
  };

  const renderReceipt = ({ item }: { item: Receipt }) => {
    const imageHasFailed = failedImages.has(item.id);
    const isBlobUri = item.imageUri.startsWith('blob:');

    return (
      <TouchableOpacity
        style={styles.receiptCard}
        onPress={() => navigation.navigate('ReceiptDetail', { receipt: item })}
      >
        {imageHasFailed || isBlobUri ? (
          <View style={[styles.thumbnail, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>📄</Text>
            <Text style={styles.placeholderSubtext}>Imagem indisponível</Text>
            {isBlobUri && (
              <Text style={styles.oldReceiptWarning}>Recibo antigo</Text>
            )}
          </View>
        ) : (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.thumbnail}
            onError={() => {
              console.error('❌ [Image] Failed to load:', item.imageUri);
              handleImageError(item.id);
            }}
            onLoad={() => {
              console.log('✅ [Image] Loaded successfully:', item.imageUri);
            }}
          />
        )}

      <View style={styles.receiptInfo}>
        <Text style={styles.storeName}>{item.storeName}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.amount}>R$ {item.totalAmount.toFixed(2)}</Text>
        <Text style={styles.date}>
          {item.date.toLocaleDateString('pt-BR')} às {item.time}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id, item.imageUri)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
    );
  };

  const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Cupons</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Total: R$ {totalSpent.toFixed(2)}</Text>
          <Text style={styles.statsText}>{receipts.length} cupons</Text>
        </View>
      </View>

      {receipts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📋</Text>
          <Text style={styles.emptyMessage}>Nenhum cupom cadastrado ainda</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('Capture')}
          >
            <Text style={styles.addButtonText}>Adicionar Primeiro Cupom</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={receipts}
          renderItem={renderReceipt}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadReceipts} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#6366F1',
    padding: 24,
    paddingTop: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  statsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginRight: 16,
  },
  receiptInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 72,
    marginBottom: 24,
  },
  emptyMessage: {
    fontSize: 19,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  imagePlaceholder: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 36,
    marginBottom: 6,
  },
  placeholderSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  oldReceiptWarning: {
    fontSize: 10,
    color: '#F59E0B',
    marginTop: 4,
    fontWeight: '700',
  },
});

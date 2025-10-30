import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Receipt, ExtractedReceiptData, SpendingByCategory, MonthlySpending } from '../types';

const RECEIPTS_COLLECTION = 'receipts';
const USER_ID = 'default_user';

export async function saveReceipt(
  imageUri: string,
  extractedData: ExtractedReceiptData
): Promise<Receipt> {
  try {
    const receiptData = {
      userId: USER_ID,
      imageUri,
      totalAmount: extractedData.totalAmount,
      date: Timestamp.fromDate(new Date(extractedData.date)),
      time: extractedData.time,
      storeName: extractedData.storeName,
      category: extractedData.category,
      items: extractedData.items || [],
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, RECEIPTS_COLLECTION), receiptData);

    return {
      id: docRef.id,
      ...receiptData,
      date: receiptData.date.toDate(),
      createdAt: receiptData.createdAt.toDate(),
    } as Receipt;
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw error;
  }
}

export async function getReceipts(): Promise<Receipt[]> {
  try {
    const q = query(
      collection(db, RECEIPTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const receipts: Receipt[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.userId === USER_ID) {
        receipts.push({
          id: doc.id,
          userId: data.userId,
          imageUri: data.imageUri,
          totalAmount: data.totalAmount,
          date: data.date.toDate(),
          time: data.time,
          storeName: data.storeName,
          category: data.category,
          items: data.items || [],
          createdAt: data.createdAt.toDate(),
        });
      }
    });

    return receipts;
  } catch (error) {
    console.error('Error getting receipts:', error);
    throw error;
  }
}

export async function deleteReceipt(receiptId: string): Promise<void> {
  try {
    console.log('🗑️ [Delete] Starting deletion process...');
    console.log('🗑️ [Delete] Receipt ID:', receiptId);
    console.log('🗑️ [Delete] Collection:', RECEIPTS_COLLECTION);

    const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    console.log('🗑️ [Delete] Document reference created');

    await deleteDoc(docRef);
    console.log('✅ [Delete] Receipt deleted successfully from Firestore');
  } catch (error) {
    console.error('❌ [Delete] Error deleting receipt:', error);
    console.error('❌ [Delete] Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export function calculateSpendingByCategory(receipts: Receipt[]): SpendingByCategory[] {
  const categoryMap = new Map<string, { total: number; count: number }>();

  receipts.forEach((receipt) => {
    const current = categoryMap.get(receipt.category) || { total: 0, count: 0 };
    categoryMap.set(receipt.category, {
      total: current.total + receipt.totalAmount,
      count: current.count + 1,
    });
  });

  const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
    percentage: (data.total / totalSpent) * 100,
  }));
}

export function calculateMonthlySpending(receipts: Receipt[]): MonthlySpending[] {
  const monthMap = new Map<string, { total: number; count: number }>();

  receipts.forEach((receipt) => {
    const monthKey = receipt.date.toISOString().slice(0, 7);
    const current = monthMap.get(monthKey) || { total: 0, count: 0 };
    monthMap.set(monthKey, {
      total: current.total + receipt.totalAmount,
      count: current.count + 1,
    });
  });

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      total: data.total,
      receipts: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

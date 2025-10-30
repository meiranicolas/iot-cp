// Types for the application

export interface Receipt {
  id: string;
  userId: string;
  imageUri: string; // Local URI - imagem armazenada apenas no dispositivo
  totalAmount: number;
  date: Date;
  time: string;
  storeName: string;
  category: string;
  items?: ReceiptItem[];
  createdAt: Date;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ExtractedReceiptData {
  totalAmount: number;
  date: string;
  time: string;
  storeName: string;
  category: string;
  items?: ReceiptItem[];
  rawText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FinancialInsight {
  id: string;
  userId: string;
  insight: string;
  category: string;
  timestamp: Date;
}

export interface SpendingByCategory {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlySpending {
  month: string;
  total: number;
  receipts: number;
}

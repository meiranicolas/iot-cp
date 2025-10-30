import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { getReceipts, calculateSpendingByCategory, calculateMonthlySpending } from '../services/receiptService';
import { generateFinancialInsights } from '../services/geminiService';
import { Receipt } from '../types';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (receipts.length === 0) return;

    setGeneratingInsights(true);
    try {
      const insightsText = await generateFinancialInsights(receipts);
      setInsights(insightsText);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (receipts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📊</Text>
        <Text style={styles.emptyMessage}>
          Adicione alguns cupons para ver seus insights financeiros
        </Text>
      </View>
    );
  }

  const categoryData = calculateSpendingByCategory(receipts);
  const monthlyData = calculateMonthlySpending(receipts);
  const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);

  const pieChartData = categoryData.map((cat, index) => ({
    name: cat.category || 'Sem categoria',
    amount: cat.total || 0,
    color: getColor(index),
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  const recentMonthlyData = monthlyData.slice(-6);
  const lineChartData = {
    labels: recentMonthlyData.map(m => {
      if (!m.month) return '??';
      const monthStr = m.month.slice(5);
      return monthStr || '??';
    }),
    datasets: [
      {
        data: recentMonthlyData.length > 0
          ? recentMonthlyData.map(m => m.total || 0)
          : [0],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Análise Financeira</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Gasto</Text>
          <Text style={styles.summaryValue}>R$ {totalSpent.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total de Cupons</Text>
          <Text style={styles.summaryValue}>{receipts.length}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ticket Médio</Text>
          <Text style={styles.summaryValue}>
            R$ {(totalSpent / receipts.length).toFixed(2)}
          </Text>
        </View>
      </View>

      {pieChartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Gastos por Categoria</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {monthlyData.length > 1 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Evolução Mensal</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#007AFF',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      <View style={styles.insightsContainer}>
        <>
        <Text style={styles.chartTitle}>Insights da IA</Text>

        {insights ? (
          <View style={styles.insightsBox}>
            <Text style={styles.insightsText}>{insights}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateInsights}
            disabled={generatingInsights}
          >
            {generatingInsights ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>
                🤖 Gerar Insights com IA
              </Text>
            )}
          </TouchableOpacity>
        )}

        {insights && (
          <TouchableOpacity
            style={[styles.generateButton, styles.regenerateButton]}
            onPress={generateInsights}
            disabled={generatingInsights}
          >
            <Text style={styles.generateButtonText}>🔄 Atualizar Insights</Text>
          </TouchableOpacity>
        )}</>
      </View>
    </ScrollView>
  );
}

function getColor(index: number): string {
  const colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF',
  ];
  return colors[index % colors.length];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightsContainer: {
    padding: 20,
    marginBottom: 20,
  },
  insightsBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  regenerateButton: {
    backgroundColor: '#007AFF',
    marginTop: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyMessage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

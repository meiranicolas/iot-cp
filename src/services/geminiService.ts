import { ExtractedReceiptData, Receipt } from '../types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastRetry = i === maxRetries - 1;

      const is503Error = error.message?.includes('503') ||
                         error.message?.includes('overloaded') ||
                         error.message?.includes('UNAVAILABLE');

      const is429Error = error.message?.includes('429') ||
                         error.message?.includes('Too Many Requests') ||
                         error.message?.includes('RESOURCE_EXHAUSTED');

      const isRetryableError = is503Error || is429Error;

      if (isLastRetry || !isRetryableError) {
        throw error;
      }

      const retryDelay = is429Error ? Math.max(delayMs * 2, 5000) : delayMs;

      console.log(`⚠️ [Gemini] Retry ${i + 1}/${maxRetries} after ${retryDelay}ms...`);
      if (is429Error) {
        console.log('⚠️ [Gemini] Rate limit exceeded - waiting longer before retry');
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
      delayMs *= 2;
    }
  }
  throw new Error('Max retries reached');
}

export async function analyzeReceiptImage(
  imageBase64: string
): Promise<ExtractedReceiptData> {
  console.log('🔍 [Gemini] Starting receipt analysis...');
  console.log('🔍 [Gemini] API URL:', GEMINI_API_URL);
  console.log('🔍 [Gemini] API Key exists:', !!GEMINI_API_KEY);
  console.log('🔍 [Gemini] Image base64 length:', imageBase64?.length || 0);

  return retryWithBackoff(async () => {
    const prompt = `Analise esta imagem de cupom fiscal brasileiro e extraia as seguintes informações em formato JSON:

    {
      "totalAmount": <valor total em número>,
      "date": "<data no formato YYYY-MM-DD>",
      "time": "<hora no formato HH:MM>",
      "storeName": "<nome do estabelecimento>",
      "category": "<categoria: alimentação, transporte, lazer, saúde, educação, vestuário, outros>",
      "items": [
        {
          "name": "<nome do item>",
          "quantity": <quantidade>,
          "price": <preço unitário>
        }
      ]
    }

    Regras:
    - Se não encontrar alguma informação, use valores padrão razoáveis
    - Para totalAmount, sempre retorne um número válido
    - Para category, escolha a categoria mais apropriada baseada no estabelecimento e itens
    - Retorne APENAS o JSON, sem texto adicional`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [Gemini] API Error Response:', JSON.stringify(errorData, null, 2));
        console.error('❌ [Gemini] HTTP Status:', response.status);
        console.error('❌ [Gemini] HTTP Status Text:', response.statusText);

        let errorMessage = errorData.error?.message || JSON.stringify(errorData);

        if (response.status === 429) {
          errorMessage = 'Limite de requisições excedido. Aguarde 1 minuto e tente novamente. Limites: 15 req/min ou 1500 req/dia.';
        } else if (response.status === 404) {
          errorMessage = 'Modelo não encontrado. Execute "node test-gemini.js" para encontrar o modelo correto.';
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = 'API key inválida ou sem permissão. Verifique sua chave no arquivo .env';
        } else if (response.status === 503) {
          errorMessage = 'Serviço temporariamente indisponível. Tentando novamente...';
        }

        throw new Error(`Gemini API Error (${response.status}): ${errorMessage}`);
      }

      console.log('✅ [Gemini] Receipt analysis successful!');

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;

      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from response');
      }

      const extractedData: ExtractedReceiptData = JSON.parse(jsonMatch[0]);

      return extractedData;
  }, 3, 2000);
}

export async function generateFinancialInsights(
  receipts: Receipt[]
): Promise<string> {
  return retryWithBackoff(async () => {
    const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
    const categorySpending = receipts.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const prompt = `Você é um assistente financeiro inteligente. Analise os seguintes dados de gastos do usuário e forneça insights personalizados e acionáveis:

Dados:
- Total gasto: R$ ${totalSpent.toFixed(2)}
- Número de compras: ${receipts.length}
- Gastos por categoria: ${JSON.stringify(categorySpending, null, 2)}

Forneça:
1. Uma análise geral dos gastos
2. Identificação de padrões de consumo
3. Sugestões práticas para economizar
4. Alertas sobre categorias com gastos elevados
5. Comparação com mês anterior se houver dados

Seja conciso, prático e use linguagem amigável. Use emojis relevantes.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate insights');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }, 2, 1000);
}

function buildDetailedContext(receipts: Receipt[]): string {
  const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const recentReceipts = receipts.slice(-50);

  let context = `Você é um assistente financeiro pessoal.\n\n`;
  context += `RESUMO GERAL:\n`;
  context += `- Total de cupons: ${receipts.length}\n`;
  context += `- Valor total gasto: R$ ${totalSpent.toFixed(2)}\n\n`;

  if (recentReceipts.length > 0) {
    context += `RECIBOS DETALHADOS (${recentReceipts.length} mais recentes):\n\n`;

    recentReceipts.forEach((receipt, index) => {
      const dateStr = receipt.date instanceof Date
        ? receipt.date.toLocaleDateString('pt-BR')
        : new Date(receipt.date).toLocaleDateString('pt-BR');

      context += `${index + 1}. [${dateStr}] ${receipt.storeName} - R$ ${receipt.totalAmount.toFixed(2)} (${receipt.category})\n`;

      if (receipt.items && receipt.items.length > 0) {
        const itemsToShow = receipt.items.slice(0, 5);
        context += `   Itens: `;
        context += itemsToShow.map(item =>
          `${item.name} (R$ ${item.price.toFixed(2)})`
        ).join(', ');

        if (receipt.items.length > 5) {
          context += ` ... e mais ${receipt.items.length - 5} itens`;
        }
        context += `\n`;
      }
      context += `\n`;
    });
  }

  context += `\nCom base nesses dados, responda às perguntas do usuário de forma precisa e útil.`;

  return context;
}

export async function chatWithAssistant(
  message: string,
  receipts: Receipt[],
  chatHistory: Array<{ role: string; content: string }>
): Promise<string> {
  return retryWithBackoff(async () => {
    console.log('💬 [Chat] Starting chat request...');
    console.log('💬 [Chat] Message:', message);
    console.log('💬 [Chat] History length:', chatHistory.length);
    console.log('💬 [Chat] Receipts count:', receipts.length);

    const context = buildDetailedContext(receipts);
    console.log('💬 [Chat] Context length:', context.length, 'chars');
    console.log('💬 [Chat] Context preview:', context.substring(0, 200) + '...');

    const contents = [];

    if (chatHistory.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `${context}\n\n${message}` }],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: context }],
      });

      chatHistory.forEach((msg) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      });

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    console.log('💬 [Chat] Contents array length:', contents.length);
    console.log('💬 [Chat] Contents structure:', JSON.stringify(contents.map(c => ({ role: c.role, textLength: c.parts[0].text.length })), null, 2));

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [Chat] API Error Response:', JSON.stringify(errorData, null, 2));
      console.error('❌ [Chat] HTTP Status:', response.status);
      console.error('❌ [Chat] HTTP Status Text:', response.statusText);

      let errorMessage = errorData.error?.message || JSON.stringify(errorData);

      if (response.status === 400) {
        errorMessage = 'Erro na requisição do chat. Verifique o formato das mensagens.';
        console.error('❌ [Chat] Request payload that caused 400:', JSON.stringify({ contents }, null, 2));
      } else if (response.status === 429) {
        errorMessage = 'Limite de requisições excedido. Aguarde 1 minuto e tente novamente.';
      }

      throw new Error(`Chat API Error (${response.status}): ${errorMessage}`);
    }

    console.log('✅ [Chat] Chat response received successfully');

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }, 2, 1000);
}

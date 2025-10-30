# 🧾 Smart Receipt Analyzer

Aplicativo React Native + Expo que utiliza IA Generativa (Google Gemini 2.0 Flash) para analisar cupons fiscais e gerar insights financeiros personalizados.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Configuração](#instalação-e-configuração)
- [Etapas de Desenvolvimento](#etapas-de-desenvolvimento)
- [Uso da IA no Projeto](#uso-da-ia-no-projeto)
- [Arquitetura](#arquitetura)
- [Dificuldades e Aprendizados](#dificuldades-e-aprendizados)
- [Licença](#licença)

## Sobre o Projeto

Aplicativo multiplataforma (iOS, Android, Web) que digitaliza e analisa cupons fiscais automaticamente usando Inteligência Artificial, gerando insights financeiros personalizados.

### Plataformas Suportadas

- ✅ **iOS** - Armazenamento local de imagens (100% gratuito)
- ✅ **Android** - Armazenamento local de imagens (100% gratuito)
- ✅ **Web** - Imagens em base64 no Firestore (free tier)

## Funcionalidades

### Core Features

1. **Captura de Cupons Fiscais**
   - Câmera integrada
   - Upload da galeria
   - Preview antes do processamento

2. **Extração Automática de Dados com IA**
   - Análise de imagem via Gemini 2.0 Flash
   - Extração de: valor total, data/hora, estabelecimento, categoria, itens

3. **Persistência Inteligente**
   - Mobile: Imagens em file system local
   - Web: Imagens em base64 no Firestore
   - Metadados sempre no Firestore

4. **Insights Financeiros com IA**
   - Análise automática de gastos
   - Identificação de padrões
   - Sugestões personalizadas de economia
   - Alertas de categorias com gastos elevados

5. **Chat Assistente Financeiro**
   - Conversação em linguagem natural
   - Contexto completo dos gastos
   - Respostas sobre compras específicas

6. **Visualizações**
   - Gráfico de pizza (gastos por categoria)
   - Gráfico de linha (evolução mensal)
   - Cards com resumo financeiro

## Tecnologias Utilizadas

### Frontend
- React Native 0.81
- Expo 54
- TypeScript 5.9
- React Navigation 7

### Backend & IA
- Firebase Firestore (metadados)
- expo-file-system (armazenamento mobile)
- **Google Gemini 2.0 Flash Experimental** (IA)

### Bibliotecas
- react-native-chart-kit (gráficos)
- expo-image-picker (câmera/galeria)
- expo-notifications (notificações)

## Instalação e Configuração

### Pré-requisitos

```bash
Node.js 18+
npm ou yarn
Expo CLI
```

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/smart-receipt-analyzer.git
cd smart-receipt-analyzer
```

### 2. Instale Dependências

```bash
npm install
```

### 3. Configure Firebase

Crie um projeto no [Firebase Console](https://console.firebase.google.com) e habilite Firestore.

Crie arquivo `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123

EXPO_PUBLIC_GEMINI_API_KEY=sua_gemini_key
```

### 4. Execute o App

```bash
npm start          # Menu interativo
npm run android    # Android
npm run ios        # iOS (macOS only)
npm run web        # Navegador
```

## Etapas de Desenvolvimento

### Fase 1: Setup e Planejamento (Dia 1)

**Objetivo:** Configurar ambiente e definir arquitetura

**Atividades:**
- Criação do projeto Expo + TypeScript
- Setup do Firebase (Firestore)
- Configuração do Gemini API
- Definição da estrutura de pastas
- Setup do React Navigation

**Decisões Técnicas:**
- Uso de Expo para desenvolvimento multiplataforma rápido
- Firebase Firestore para armazenamento gratuito
- Evitar Firebase Storage (custos) usando armazenamento local

### Fase 2: Feature Core - Captura e Análise (Dias 2-3)

**Objetivo:** Implementar captura e análise de cupons

**Atividades:**
- Implementação da tela de captura com expo-image-picker
- Integração com Gemini API para análise de imagens
- Conversão de imagem para base64
- Criação do prompt de extração de dados
- Implementação de retry logic para API
- Storage multiplataforma (web vs mobile)

**Desafios:**
- Ajuste do prompt para extração precisa
- Handling de diferentes formatos de cupons
- Rate limiting do Gemini API

### Fase 3: Persistência e Listagem (Dia 4)

**Objetivo:** Salvar e visualizar cupons

**Atividades:**
- Implementação do receiptService com Firestore
- Storage de imagens (file system mobile / base64 web)
- Tela de listagem com FlatList
- Tela de detalhes do cupom
- Funcionalidade de deleção

**Desafios:**
- Queries Firestore sem composite indexes
- Persistência de imagens na web (blob URIs expiram)
- Compatibilidade Alert.alert na web

### Fase 4: Insights e Chat (Dias 5-6)

**Objetivo:** IA para insights e assistente

**Atividades:**
- Tela de insights com gráficos
- Prompt para geração de insights financeiros
- Implementação do chat assistente
- Context building com dados detalhados dos recibos
- Sistema de notificações

**Desafios:**
- Balancear tamanho do contexto vs limite de tokens
- Estrutura correta de mensagens no chat (role obrigatório)
- Warnings de react-native-chart-kit na web

### Fase 5: Otimizações e Correções (Dia 7)

**Objetivo:** Polimento e correções finais

**Atividades:**
- Correção de erros 400/404/429 da Gemini API
- Implementação de tratamento de erros robusto
- Logs detalhados para debug
- Placeholder para imagens quebradas
- Supressão de warnings de bibliotecas
- Documentação completa

**Correções Importantes:**
- Modelo Gemini atualizado de gemini-pro-vision para gemini-2.0-flash-exp
- Alert.alert substituído por window.confirm na web
- Validações em gráficos para evitar texto solto
- Contexto detalhado no chat com todos os dados dos recibos

## Uso da IA no Projeto

### 1. Google Gemini 2.0 Flash Experimental

**Modelo Utilizado:** `gemini-2.0-flash-exp` (v1beta API)

**Por que este modelo?**
- Suporta análise de imagens (vision)
- Suporta conversação (chat)
- Gratuito no free tier (15 req/min, 1500 req/dia)
- Modelo mais recente disponível para a API key do projeto

### 2. Análise de Cupons Fiscais

**Prompt de Extração:**

```javascript
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
- Para category, escolha a categoria mais apropriada
- Retorne APENAS o JSON, sem texto adicional`;
```

**Exemplo de Resposta:**

```json
{
  "totalAmount": 85.50,
  "date": "2025-01-15",
  "time": "14:30",
  "storeName": "Supermercado ABC",
  "category": "alimentação",
  "items": [
    { "name": "Arroz", "quantity": 1, "price": 20.00 },
    { "name": "Feijão", "quantity": 2, "price": 15.00 },
    { "name": "Carne", "quantity": 1, "price": 50.50 }
  ]
}
```

### 3. Geração de Insights Financeiros

**Prompt de Insights:**

```javascript
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
```

**Exemplo de Resposta:**

```
📊 Análise dos Seus Gastos

Você gastou R$ 850,00 em 12 compras este mês. Aqui estão os principais insights:

💡 Padrões Identificados:
- Alimentação representa 65% dos seus gastos (R$ 552,50)
- Você faz compras principalmente aos fins de semana
- Ticket médio de R$ 70,83 por compra

⚠️ Alertas:
- Gastos com alimentação estão 40% acima da média recomendada
- Houve um aumento de 25% em relação ao mês passado

💰 Dicas de Economia:
1. Planeje compras semanais para evitar idas frequentes ao mercado
2. Compare preços entre estabelecimentos
3. Prefira marcas próprias em itens básicos (pode economizar até 30%)

✅ Pontos Positivos:
- Você tem registrado suas compras consistentemente
- Boa diversificação de categorias
```

### 4. Chat Assistente

**Contexto Enviado:**

```javascript
const context = `Você é um assistente financeiro pessoal.

RESUMO GERAL:
- Total de cupons: 12
- Valor total gasto: R$ 850,00

RECIBOS DETALHADOS (12 mais recentes):

1. [15/01/2025] Supermercado ABC - R$ 85,50 (Alimentação)
   Itens: Arroz (R$ 20,00), Feijão (R$ 15,00), Carne (R$ 50,50)

2. [20/01/2025] Posto Shell - R$ 120,00 (Transporte)
   Itens: Gasolina (R$ 120,00)

...

Com base nesses dados, responda às perguntas do usuário de forma precisa e útil.`;
```

**Exemplo de Conversação:**

```
Usuário: Qual foi minha maior compra?

IA: Sua maior compra foi de R$ 120,00 no Posto Shell em 20/01/2025,
categoria Transporte. Foi um abastecimento de gasolina.

Usuário: Quanto gastei em alimentação?

IA: Você gastou R$ 552,50 em alimentação, o que representa 65%
do seu total de gastos. Foram 8 compras nesta categoria, com ticket
médio de R$ 69,06.
```

### Estrutura em 3 Camadas

```
┌─────────────────────────────────────┐
│     UI Layer (Screens)              │
│  - CaptureReceiptScreen             │
│  - ReceiptsListScreen               │
│  - ReceiptDetailScreen              │
│  - InsightsScreen                   │
│  - ChatScreen                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Logic Layer (Services)            │
│  - geminiService (IA)               │
│  - receiptService (Firestore)       │
│  - fileSystem (Storage)             │
│  - notificationService              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Data Layer                       │
│  - Firebase Firestore (metadados)   │
│  - File System (imagens mobile)     │
│  - Firestore (imagens web/base64)   │
└─────────────────────────────────────┘
```

### Fluxo de Dados: Captura → Análise → Storage

```
1. Usuário captura/seleciona imagem
   ↓
2. Imagem convertida para base64
   ↓
3. Enviada para Gemini API
   ↓
4. IA extrai dados estruturados (JSON)
   ↓
5. Imagem salva:
   - Mobile: file system local
   - Web: base64 no Firestore
   ↓
6. Metadados salvos no Firestore
   ↓
7. Lista atualizada automaticamente
```


#### 1. Compatibilidade de Modelos do Gemini

**Problema:**
- Diferentes API keys têm acesso a diferentes modelos
- Modelos deprecados (gemini-pro-vision) retornavam 404
- Documentação não deixava claro quais modelos funcionam com v1 vs v1beta

**Solução:**
- Criado script `test-gemini.js` que testa automaticamente modelos disponíveis
- Identificado `gemini-2.0-flash-exp` como modelo funcional
- Documentação clara sobre como verificar modelos disponíveis

**Aprendizado:**
- Sempre testar APIs antes de assumir que funcionarão
- Scripts de diagnóstico são essenciais para debug
- Modelos de IA mudam frequentemente - código deve ser flexível

#### 2. Storage na Web (Blob URIs)

**Problema:**
- Blob URIs (`blob:http://...`) expiram quando navegador fecha
- Recibos antigos ficavam com imagens quebradas
- `expo-file-system` não funciona nativamente na web

**Solução:**
- Detecção de plataforma com `Platform.OS`
- Web: converter imagem para base64 e salvar no Firestore
- Mobile: usar file system local (grátis)
- Placeholder visual para imagens quebradas

**Aprendizado:**
- Blob URIs são temporários - nunca usar para storage permanente
- Web e mobile têm paradigmas diferentes de storage
- Sempre considerar multiplataforma desde o início

#### 3. Rate Limiting do Gemini API

**Problema:**
- Limite de 15 requisições/minuto no free tier
- Durante testes, fácil exceder limite
- Erro 429 quebrava experiência do usuário

**Solução:**
- Implementado retry logic com exponential backoff
- Delays maiores específicos para erro 429 (5+ segundos)
- Mensagens de erro amigáveis ao usuário
- Logs detalhados para debug

**Aprendizado:**
- Free tiers têm limitações - sempre implementar retry logic
- Exponential backoff é essencial para APIs
- UX deve considerar limitações de APIs externas

#### 4. Estrutura de Mensagens do Chat

**Problema:**
- Erro 400 ao enviar mensagens no chat
- API exigia que TODOS os items tivessem `role` ou NENHUM
- Documentação não deixava isso claro

**Solução:**
- Análise detalhada do payload enviado
- Logs estruturados mostrando cada campo
- Ajuste para garantir `role` em todos os items

**Aprendizado:**
- Logar payloads completos facilita muito debug
- Ler mensagens de erro com atenção
- Testar APIs com payloads mínimos primeiro

#### 5. Contexto do Chat (Dados Insuficientes)

**Problema:**
- IA não conseguia responder "qual foi minha maior compra?"
- Contexto enviado tinha apenas resumo (total e quantidade)
- Faltavam dados detalhados dos recibos

**Solução:**
- Criada função `buildDetailedContext()` que formata todos os recibos
- Limitado a 50 recibos mais recentes (evitar exceder tokens)
- Limitado a 5 itens por recibo
- Estrutura clara e legível para a IA

**Aprendizado:**
- Context is king - IA precisa de dados detalhados
- Balancear quantidade de contexto vs limite de tokens
- Formatação clara ajuda a IA a entender melhor

#### 6. React Native Web (Warnings e Incompatibilidades)

**Problema:**
- `Alert.alert` não funciona na web
- `react-native-chart-kit` gera warnings de DOM na web
- Muitas propriedades mobile-only não existem no DOM

**Solução:**
- Alert.alert → window.confirm na web (detecção de plataforma)
- Criado sistema de supressão de warnings conhecidos
- Validações em gráficos para evitar texto solto em Views

**Aprendizado:**
- React Native Web tem limitações - sempre testar
- Detecção de plataforma é essencial para código multiplataforma
- Warnings podem ser ruído - suprimir apenas conhecidos e inofensivos

### Principais Aprendizados

#### Sobre IA Generativa

1. **Prompts são críticos** - Prompt bem estruturado = resultados melhores
2. **Context matters** - Quanto mais contexto relevante, melhores as respostas
3. **Erros são comuns** - Sempre implementar retry e fallbacks
4. **Modelos mudam** - Código deve ser flexível e configurável
5. **Custos existem** - Free tiers têm limites, planejar adequadamente

#### Sobre Desenvolvimento Mobile

1. **Expo facilita muito** - Desenvolvimento rápido e cross-platform
2. **Plataformas são diferentes** - Web ≠ Mobile, sempre testar ambos
3. **Storage é complexo** - Cada plataforma tem seu paradigma
4. **Performance importa** - Otimizar imagens e requisições
5. **UX é fundamental** - Loading states, error handling, feedback visual

#### Sobre Firebase

1. **Firestore é poderoso** - Real-time, escalável, gratuito (dentro do tier)
2. **Queries têm regras** - where + orderBy requer composite index
3. **Client-side filtering** - Às vezes mais simples que criar indexes
4. **Security Rules** - Importantes para produção (aqui permitimos tudo para simplicidade)

#### Sobre Arquitetura

1. **Separação de camadas** - UI/Logic/Data facilita manutenção
2. **Services são essenciais** - Centralizar lógica de negócio
3. **TypeScript ajuda** - Menos bugs, melhor DX
4. **Logs são amigos** - Debug fica muito mais fácil com logs estruturados

#### 1. Análise de Imagens com Gemini

```typescript
export async function analyzeReceiptImage(
  imageBase64: string
): Promise<ExtractedReceiptData> {
  return retryWithBackoff(async () => {
    const prompt = `Analise esta imagem de cupom fiscal...`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  }, 3, 2000);
}
```

#### 2. Context Building para Chat

```typescript
function buildDetailedContext(receipts: Receipt[]): string {
  const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const recentReceipts = receipts.slice(-50);

  let context = `Você é um assistente financeiro pessoal.\n\n`;
  context += `RESUMO GERAL:\n`;
  context += `- Total de cupons: ${receipts.length}\n`;
  context += `- Valor total gasto: R$ ${totalSpent.toFixed(2)}\n\n`;

  if (recentReceipts.length > 0) {
    context += `RECIBOS DETALHADOS:\n\n`;

    recentReceipts.forEach((receipt, index) => {
      const dateStr = receipt.date.toLocaleDateString('pt-BR');
      context += `${index + 1}. [${dateStr}] ${receipt.storeName} - R$ ${receipt.totalAmount.toFixed(2)} (${receipt.category})\n`;

      if (receipt.items && receipt.items.length > 0) {
        const itemsToShow = receipt.items.slice(0, 5);
        context += `   Itens: `;
        context += itemsToShow.map(item =>
          `${item.name} (R$ ${item.price.toFixed(2)})`
        ).join(', ');
        context += `\n`;
      }
      context += `\n`;
    });
  }

  return context;
}
```

#### 3. Storage Multiplataforma

```typescript
export async function saveImagePermanently(tempUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return await convertToBase64DataURI(tempUri);
  }

  const receiptsDirPath = `${FileSystem.documentDirectory}receipts/`;
  await FileSystem.makeDirectoryAsync(receiptsDirPath, { intermediates: true });

  const filename = `receipt_${Date.now()}.jpg`;
  const permanentFilePath = receiptsDirPath + filename;

  await FileSystem.copyAsync({ from: tempUri, to: permanentFilePath });
  return permanentFilePath;
}
```

#### 4. Retry Logic com Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const is429Error = error.message?.includes('429');
      const isRetryableError = is429Error || error.message?.includes('503');

      if (i === maxRetries - 1 || !isRetryableError) throw error;

      const retryDelay = is429Error ? Math.max(delayMs * 2, 5000) : delayMs;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      delayMs *= 2;
    }
  }
}
```

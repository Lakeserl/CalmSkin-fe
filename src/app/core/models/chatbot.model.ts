/**
 * AI Chatbot-service contracts. Mirrors ai-chatbot-service ChatController DTOs.
 * Endpoint base: /api/v1/ai/chat.
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageDTO {
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ConversationDTO {
  id: number;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messages: MessageDTO[];
}

export interface ChatRequest {
  /** Omit to start a new conversation. */
  conversationId?: number;
  message: string;
}

export interface ChatResponse {
  conversationId: number;
  response: string;
  suggestedActions?: string[];
  tokensUsed?: number;
}

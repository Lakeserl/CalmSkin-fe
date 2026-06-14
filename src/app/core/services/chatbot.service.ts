import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import { ChatRequest, ChatResponse, ConversationDTO } from '../models/chatbot.model';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly api = inject(ApiService);

  /** POST /api/v1/ai/chat — send message; omit conversationId to start fresh. */
  send(body: ChatRequest): Observable<ApiResponse<ChatResponse>> {
    return this.api.post<ChatResponse>('/api/v1/ai/chat', body);
  }

  /** GET /api/v1/ai/chat/conversations — list user's conversations. */
  listConversations(): Observable<ApiResponse<ConversationDTO[]>> {
    return this.api.get<ConversationDTO[]>('/api/v1/ai/chat/conversations');
  }

  /** GET /api/v1/ai/chat/conversations/{id} — full message history. */
  getConversation(id: number): Observable<ApiResponse<ConversationDTO>> {
    return this.api.get<ConversationDTO>(`/api/v1/ai/chat/conversations/${id}`);
  }

  /** DELETE /api/v1/ai/chat/conversations/{id} */
  deleteConversation(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/api/v1/ai/chat/conversations/${id}`);
  }
}

import httpClient from './client';
import type { Conversation, Message, CreateConversationRequest } from '../types/message.types';

export const messagesApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await httpClient.get('/messages/conversations');
    const data = response.data;
    return data.items || data || [];
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await httpClient.get(
      `/messages/conversations/${conversationId}/messages`
    );
    const data = response.data;
    return data.items || data || [];
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const response = await httpClient.post(
      `/messages/conversations/${conversationId}/messages`,
      null,
      { params: { content } }
    );
    return response.data;
  },

  createConversation: async (data: CreateConversationRequest): Promise<Conversation> => {
    const response = await httpClient.post('/messages/conversations', data);
    return response.data;
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await httpClient.delete(`/messages/conversations/${conversationId}`);
  },
};

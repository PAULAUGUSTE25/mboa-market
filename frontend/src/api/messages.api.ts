import httpClient from './client';
import type { Conversation, Message, CreateConversationRequest } from '../types/message.types';

export const messagesApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await httpClient.get('/messages/conversations');
    const items = response.data?.items ?? response.data ?? [];
    return items.map((conversation: Conversation & { listing_title?: string }) => ({
      ...conversation,
      listing_title: conversation.listing_title,
    }));
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
      { content }
    );
    return response.data;
  },

  createConversation: async (data: CreateConversationRequest): Promise<{ id: string }> => {
    const response = await httpClient.post('/messages/conversations', data);
    return response.data;
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await httpClient.delete(`/messages/conversations/${conversationId}`);
  },
};

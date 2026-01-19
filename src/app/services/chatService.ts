import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../environments/environment';
import { AuthService } from './authService';
import { ConversationDTO, EnvoyerMessageRequest, MessageDTO } from '../models/chat';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private stompClient: Client | null = null;
  private readonly wsUrl = 'http://localhost:8080/ws';

  // Signals for reactive state
  conversations = signal<ConversationDTO[]>([]);
  currentMessages = signal<MessageDTO[]>([]);
  unreadCount = signal<number>(0);
  isConnected = signal<boolean>(false);

  // Connect to WebSocket
  connect(): void {
    const user = this.authService.currentUser();
    if (!user || this.stompClient?.connected) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.isConnected.set(true);
        this.subscribeToUserMessages(user.id);
      },
      onDisconnect: () => {
        this.isConnected.set(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
    });

    this.stompClient.activate();
  }

  // Subscribe to user's personal channel
  private subscribeToUserMessages(userId: number): void {
    if (!this.stompClient) return;

    this.stompClient.subscribe(`/topic/user.${userId}`, (message: IMessage) => {
      const newMessage: MessageDTO = JSON.parse(message.body);
      this.handleIncomingMessage(newMessage);
    });
  }

  // Subscribe to a specific conversation
  subscribeToConversation(conversationId: number): void {
    if (!this.stompClient?.connected) return;

    this.stompClient.subscribe(`/topic/conversation.${conversationId}`, (message: IMessage) => {
      const newMessage: MessageDTO = JSON.parse(message.body);
      this.handleIncomingMessage(newMessage);
    });
  }

  // Handle incoming real-time messages
  private handleIncomingMessage(message: MessageDTO): void {
    // Add to current messages if viewing this conversation
    const currentMsgs = this.currentMessages();
    if (currentMsgs.length > 0 && currentMsgs[0].conversationId === message.conversationId) {
      this.currentMessages.update((msgs) => [...msgs, message]);
    }

    // Refresh conversations to update last message
    this.loadConversations();
  }

  // Send message via WebSocket
  sendMessageWs(request: EnvoyerMessageRequest): void {
    if (!this.stompClient?.connected) {
      // Fallback to REST if WebSocket not connected
      this.sendMessageRest(request).subscribe();
      return;
    }

    this.stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(request),
    });
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnected.set(false);
    }
  }

  // REST API Methods
  loadConversations(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.http
      .get<ConversationDTO[]>(`${environment.apiUrl}/messages/conversations/${user.id}`)
      .subscribe({
        next: (convos) => this.conversations.set(convos),
        error: (err) => console.error('Failed to load conversations:', err),
      });
  }

  loadMessages(conversationId: number): void {
    this.http
      .get<MessageDTO[]>(`${environment.apiUrl}/messages/conversation/${conversationId}`)
      .subscribe({
        next: (msgs) => this.currentMessages.set(msgs),
        error: (err) => console.error('Failed to load messages:', err),
      });
  }

  sendMessageRest(request: EnvoyerMessageRequest) {
    return this.http.post<MessageDTO>(`${environment.apiUrl}/messages/envoyer`, request);
  }

  markAsRead(conversationId: number): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.http
      .put(`${environment.apiUrl}/messages/lu/${conversationId}/${user.id}`, {})
      .subscribe({
        next: () => this.loadUnreadCount(),
        error: (err) => console.error('Failed to mark as read:', err),
      });
  }

  loadUnreadCount(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.http.get<number>(`${environment.apiUrl}/messages/non-lus/${user.id}`).subscribe({
      next: (count) => this.unreadCount.set(count),
      error: (err) => console.error('Failed to load unread count:', err),
    });
  }

  deleteMessage(messageId: number): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.http.delete(`${environment.apiUrl}/messages/${messageId}/${user.id}`).subscribe({
      next: () => {
        this.currentMessages.update((msgs) => msgs.filter((m) => m.id !== messageId));
      },
      error: (err) => console.error('Failed to delete message:', err),
    });
  }
}

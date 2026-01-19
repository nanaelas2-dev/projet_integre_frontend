import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chatService';
import { AuthService } from '../../services/authService';
import { ConversationDTO, EnvoyerMessageRequest } from '../../models/chat';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  // Expose signals to template
  conversations = this.chatService.conversations;
  messages = this.chatService.currentMessages;
  isConnected = this.chatService.isConnected;

  // Local state
  selectedConversation = signal<ConversationDTO | null>(null);
  newMessage = signal<string>('');
  isOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.chatService.connect();
    this.chatService.loadConversations();
    this.chatService.loadUnreadCount();
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }

  toggleChat(): void {
    this.isOpen.update((v) => !v);
  }

  selectConversation(conversation: ConversationDTO): void {
    this.selectedConversation.set(conversation);
    this.chatService.loadMessages(conversation.id);
    this.chatService.subscribeToConversation(conversation.id);
    this.chatService.markAsRead(conversation.id);
  }

  backToList(): void {
    this.selectedConversation.set(null);
    this.chatService.currentMessages.set([]);
  }

  sendMessage(): void {
    const content = this.newMessage().trim();
    const conversation = this.selectedConversation();
    const user = this.authService.currentUser();

    if (!content || !conversation || !user) return;

    const request: EnvoyerMessageRequest = {
      expeditricId: user.id,
      destinataireId: conversation.autreParticipanteId,
      contenu: content,
    };

    this.chatService.sendMessageWs(request);
    this.newMessage.set('');
  }

  isOwnMessage(expeditricId: number): boolean {
    return this.authService.currentUser()?.id === expeditricId;
  }

  get unreadCount() {
    return this.chatService.unreadCount;
  }
}

import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chatService';
import { AuthService } from '../../services/authService';
import { Users } from '../../services/usersService';
import { ConversationDTO, EnvoyerMessageRequest } from '../../models/chat';
import { User } from '../../models/user';

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
  private usersService = inject(Users);

  // Expose signals to template
  conversations = this.chatService.conversations;
  messages = this.chatService.currentMessages;
  isConnected = this.chatService.isConnected;

  // Local state
  selectedConversation = signal<ConversationDTO | null>(null);
  newMessage = signal<string>('');
  isOpen = signal<boolean>(false);
  showNewChat = signal<boolean>(false);
  availableUsers = signal<User[]>([]);
  selectedUser = signal<User | null>(null);

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
    this.selectedUser.set(null);
    this.showNewChat.set(false);
    this.chatService.currentMessages.set([]);
  }

  openNewChat(): void {
    this.showNewChat.set(true);
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        const currentUserId = this.authService.currentUser()?.id;
        this.availableUsers.set(users.filter(u => u.id !== currentUserId));
      },
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  selectUserForChat(user: User): void {
    this.selectedUser.set(user);
    this.showNewChat.set(false);
  }

  sendMessage(): void {
    const content = this.newMessage().trim();
    const user = this.authService.currentUser();
    if (!content || !user) return;

    // Determine recipient
    let destinataireId: number | undefined;
    
    if (this.selectedConversation()) {
      destinataireId = this.selectedConversation()!.autreParticipanteId;
    } else if (this.selectedUser()) {
      destinataireId = this.selectedUser()!.id;
    }

    if (!destinataireId) return;

    const request: EnvoyerMessageRequest = {
      expeditricId: user.id,
      destinataireId: destinataireId,
      contenu: content,
    };

    // Use REST API and handle response
    this.chatService.sendMessageRest(request).subscribe({
      next: (msg) => {
        // Add message to display
        this.chatService.currentMessages.update(msgs => [...msgs, msg]);
        // Refresh conversations
        this.chatService.loadConversations();
        // If new chat, set the conversation
        if (this.selectedUser() && msg.conversationId) {
          this.chatService.loadMessages(msg.conversationId);
          this.selectedUser.set(null);
        }
      },
      error: (err) => console.error('Failed to send message:', err)
    });
    
    this.newMessage.set('');
  }

  isOwnMessage(expeditricId: number): boolean {
    return this.authService.currentUser()?.id === expeditricId;
  }

  get unreadCount() {
    return this.chatService.unreadCount;
  }

  get canSendMessage(): boolean {
    return !!(this.selectedConversation() || this.selectedUser());
  }

  get chatTitle(): string {
    if (this.selectedConversation()) {
      return this.selectedConversation()!.autreParticipanteNom;
    }
    if (this.selectedUser()) {
      return `${this.selectedUser()!.prenom} ${this.selectedUser()!.nom}`;
    }
    return 'Messages';
  }
}

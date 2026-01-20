import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chatService';
import { AuthService } from '../../services/authService';
import { FriendService } from '../../services/friendService';
import { ConversationDTO, EnvoyerMessageRequest } from '../../models/chat';
import { AmieDTO } from '../../models/friend';

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
  private friendService = inject(FriendService);

  // Expose signals to template
  conversations = this.chatService.conversations;
  messages = this.chatService.currentMessages;
  isConnected = this.chatService.isConnected;
  friends = this.friendService.friends;

  // Local state
  selectedConversation = signal<ConversationDTO | null>(null);
  selectedFriend = signal<AmieDTO | null>(null);
  newMessage = signal<string>('');
  isOpen = signal<boolean>(false);
  showNewChat = signal<boolean>(false);

  ngOnInit(): void {
    this.chatService.connect();
    this.chatService.loadConversations();
    this.chatService.loadUnreadCount();
    this.friendService.loadFriends();
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }

  toggleChat(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.chatService.loadConversations();
      this.friendService.loadFriends();
    }
  }

  selectConversation(conversation: ConversationDTO): void {
    this.selectedConversation.set(conversation);
    this.selectedFriend.set(null);
    this.showNewChat.set(false);
    this.chatService.loadMessages(conversation.id);
    this.chatService.subscribeToConversation(conversation.id);
    this.chatService.markAsRead(conversation.id);
  }

  openNewChat(): void {
    this.showNewChat.set(true);
    this.selectedConversation.set(null);
    this.selectedFriend.set(null);
    this.friendService.loadFriends();
  }

  selectFriendForChat(friend: AmieDTO): void {
    // Check if conversation already exists with this friend
    const existingConvo = this.conversations().find((c) => c.autreParticipanteId === friend.id);

    if (existingConvo) {
      this.selectConversation(existingConvo);
    } else {
      this.selectedFriend.set(friend);
      this.showNewChat.set(false);
      this.chatService.currentMessages.set([]);
    }
  }

  backToList(): void {
    this.selectedConversation.set(null);
    this.selectedFriend.set(null);
    this.showNewChat.set(false);
    this.chatService.currentMessages.set([]);
  }

  sendMessage(): void {
    const content = this.newMessage().trim();
    const user = this.authService.currentUser();
    if (!content || !user) return;

    let destinataireId: number | undefined;

    if (this.selectedConversation()) {
      destinataireId = this.selectedConversation()!.autreParticipanteId;
    } else if (this.selectedFriend()) {
      destinataireId = this.selectedFriend()!.id;
    }

    if (!destinataireId) return;

    const request: EnvoyerMessageRequest = {
      expeditricId: user.id,
      destinataireId: destinataireId,
      contenu: content,
    };

    // Use REST API for reliable message sending
    this.chatService.sendMessageRest(request).subscribe({
      next: (msg) => {
        this.chatService.currentMessages.update((msgs) => [...msgs, msg]);
        this.chatService.loadConversations();

        // If new chat with friend, update to use conversation
        if (this.selectedFriend() && msg.conversationId) {
          const friend = this.selectedFriend()!;
          this.selectedFriend.set(null);
          this.selectedConversation.set({
            id: msg.conversationId,
            autreParticipanteId: friend.id,
            autreParticipanteNom: friend.nom,
            autreParticipantePrenom: friend.prenom,
            dernierMessage: msg.contenu,
            dernierMessageDate: msg.dateEnvoi,
            messagesNonLus: 0,
          });
          this.chatService.subscribeToConversation(msg.conversationId);
        }
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        alert(err.error || "Erreur lors de l'envoi du message");
      },
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
    return !!(this.selectedConversation() || this.selectedFriend());
  }

  get chatTitle(): string {
    if (this.selectedConversation()) {
      const c = this.selectedConversation()!;
      return `${c.autreParticipantePrenom} ${c.autreParticipanteNom}`;
    }
    if (this.selectedFriend()) {
      const f = this.selectedFriend()!;
      return `${f.prenom} ${f.nom}`;
    }
    return 'Messages';
  }
}

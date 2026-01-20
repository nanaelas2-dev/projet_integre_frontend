import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FriendService } from '../../services/friendService';
import { AuthService } from '../../services/authService';
import { AmieDTO, FriendRequestDTO } from '../../models/friend';
import { User } from '../../models/user';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './friends.html',
  styleUrl: './friends.css',
})
export class Friends implements OnInit {
  private friendService = inject(FriendService);
  private authService = inject(AuthService);

  // Expose signals from service
  friends = this.friendService.friends;
  receivedRequests = this.friendService.receivedRequests;
  sentRequests = this.friendService.sentRequests;
  isLoading = this.friendService.isLoading;

  // Local state
  isOpen = signal<boolean>(false);
  activeTab = signal<'friends' | 'received' | 'sent' | 'search'>('friends');
  searchQuery = signal<string>('');
  searchResults = signal<User[]>([]);
  actionMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  constructor() {
    // Reactive search: automatically filter when query changes
    effect(() => {
      const query = this.searchQuery();
      if (this.activeTab() === 'search') {
        this.searchResults.set(this.friendService.searchUsers(query));
      }
    });
  }

  ngOnInit(): void {
    this.friendService.refreshAll();
    this.friendService.loadAllUsers(); // Preload users cache
  }

  togglePanel(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.friendService.refreshAll();
      this.friendService.loadAllUsers();
    }
  }

  setTab(tab: 'friends' | 'received' | 'sent' | 'search'): void {
    this.activeTab.set(tab);
    this.actionMessage.set(null);
    if (tab === 'search') {
      // Trigger search with current query
      this.searchResults.set(this.friendService.searchUsers(this.searchQuery()));
    }
  }

  // Check if request already sent to user
  isRequestSent(userId: number): boolean {
    return this.sentRequests().some((r) => r.destinataireId === userId);
  }

  // Check if request received from user
  isRequestReceived(userId: number): boolean {
    return this.receivedRequests().some((r) => r.expeditriceId === userId);
  }

  // Send friend request
  sendRequest(destinataireId: number): void {
    this.friendService.sendFriendRequest(destinataireId).subscribe({
      next: () => {
        this.showMessage('success', 'Demande envoyée!');
        this.friendService.loadSentRequests();
        // Refresh search results
        this.searchResults.set(this.friendService.searchUsers(this.searchQuery()));
      },
      error: (err) => {
        this.showMessage('error', err.error || 'Erreur lors de l\'envoi');
      },
    });
  }

  // Accept request
  acceptRequest(request: FriendRequestDTO): void {
    this.friendService.acceptRequest(request.id).subscribe({
      next: () => {
        this.showMessage('success', `${request.expeditricePrenom} est maintenant votre amie!`);
        this.friendService.refreshAll();
        this.friendService.invalidateUserCache();
        this.friendService.loadAllUsers();
      },
      error: (err) => {
        this.showMessage('error', err.error || 'Erreur');
      },
    });
  }

  // Reject request
  rejectRequest(request: FriendRequestDTO): void {
    this.friendService.rejectRequest(request.id).subscribe({
      next: () => {
        this.showMessage('success', 'Demande refusée');
        this.friendService.loadReceivedRequests();
      },
      error: (err) => {
        this.showMessage('error', err.error || 'Erreur');
      },
    });
  }

  // Cancel sent request
  cancelRequest(request: FriendRequestDTO): void {
    this.friendService.cancelRequest(request.id).subscribe({
      next: () => {
        this.showMessage('success', 'Demande annulée');
        this.friendService.loadSentRequests();
      },
      error: (err) => {
        this.showMessage('error', err.error || 'Erreur');
      },
    });
  }

  // Remove friend
  removeFriend(friend: AmieDTO): void {
    if (!confirm(`Supprimer ${friend.prenom} ${friend.nom} de vos amies?`)) return;

    this.friendService.removeFriend(friend.id).subscribe({
      next: () => {
        this.showMessage('success', 'Amie supprimée');
        this.friendService.loadFriends();
        this.friendService.invalidateUserCache();
        this.friendService.loadAllUsers();
      },
      error: (err) => {
        this.showMessage('error', err.error || 'Erreur');
      },
    });
  }

  private showMessage(type: 'success' | 'error', text: string): void {
    this.actionMessage.set({ type, text });
    setTimeout(() => this.actionMessage.set(null), 3000);
  }

  get pendingCount(): number {
    return this.receivedRequests().length;
  }
}

import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthService } from './authService';
import { AmieDTO, FriendRequestDTO } from '../models/friend';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Signals for reactive state
  friends = signal<AmieDTO[]>([]);
  receivedRequests = signal<FriendRequestDTO[]>([]);
  sentRequests = signal<FriendRequestDTO[]>([]);
  isLoading = signal<boolean>(false);

  // Cached users for search (loaded once)
  private allUsers = signal<User[]>([]);
  private usersLoaded = signal<boolean>(false);

  // Computed: searchable users (excludes current user and existing friends)
  searchableUsers = computed(() => {
    const currentUserId = this.authService.currentUser()?.id;
    const friendIds = new Set(this.friends().map((f) => f.id));
    
    return this.allUsers().filter((u) => {
      if (u.id === currentUserId) return false;
      if (friendIds.has(u.id)) return false;
      return true;
    });
  });

  // Load all users once for search (cached)
  loadAllUsers(): void {
    if (this.usersLoaded()) return; // Already loaded

    this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.usersLoaded.set(true);
      },
      error: (err) => console.error('Failed to load users:', err),
    });
  }

  // Search users locally from cache
  searchUsers(query: string): User[] {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return this.searchableUsers().filter((u) => {
      const fullName = `${u.prenom} ${u.nom}`.toLowerCase();
      const email = u.email.toLowerCase();
      return fullName.includes(lowerQuery) || email.includes(lowerQuery);
    });
  }

  // Invalidate cache (call after friend changes)
  invalidateUserCache(): void {
    this.usersLoaded.set(false);
  }

  // Get all friends
  loadFriends(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isLoading.set(true);
    this.http.get<AmieDTO[]>(`${environment.apiUrl}/amies/${user.id}`).subscribe({
      next: (friends) => {
        this.friends.set(friends);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load friends:', err);
        this.isLoading.set(false);
      },
    });
  }

  // Get pending requests received
  loadReceivedRequests(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.http
      .get<FriendRequestDTO[]>(`${environment.apiUrl}/amies/demandes/recues/${user.id}`)
      .subscribe({
        next: (requests) => this.receivedRequests.set(requests),
        error: (err) => console.error('Failed to load received requests:', err),
      });
  }

  // Get pending requests sent
  loadSentRequests(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.http
      .get<FriendRequestDTO[]>(`${environment.apiUrl}/amies/demandes/envoyees/${user.id}`)
      .subscribe({
        next: (requests) => this.sentRequests.set(requests),
        error: (err) => console.error('Failed to load sent requests:', err),
      });
  }

  // Send friend request
  sendFriendRequest(destinataireId: number): Observable<FriendRequestDTO> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    return this.http.post<FriendRequestDTO>(
      `${environment.apiUrl}/amies/demande/${user.id}/${destinataireId}`,
      {}
    );
  }

  // Accept friend request
  acceptRequest(requestId: number): Observable<FriendRequestDTO> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    return this.http.put<FriendRequestDTO>(
      `${environment.apiUrl}/amies/accepter/${requestId}/${user.id}`,
      {}
    );
  }

  // Reject friend request
  rejectRequest(requestId: number): Observable<FriendRequestDTO> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    return this.http.put<FriendRequestDTO>(
      `${environment.apiUrl}/amies/refuser/${requestId}/${user.id}`,
      {}
    );
  }

  // Cancel sent request
  cancelRequest(requestId: number): Observable<void> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    return this.http.delete<void>(
      `${environment.apiUrl}/amies/annuler/${requestId}/${user.id}`
    );
  }

  // Remove friend
  removeFriend(amieId: number): Observable<void> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    return this.http.delete<void>(
      `${environment.apiUrl}/amies/supprimer/${user.id}/${amieId}`
    );
  }

  // Check if two users are friends
  checkFriendship(otherUserId: number): Observable<boolean> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    return this.http.get<boolean>(
      `${environment.apiUrl}/amies/check/${user.id}/${otherUserId}`
    );
  }

  // Refresh all data
  refreshAll(): void {
    this.loadFriends();
    this.loadReceivedRequests();
    this.loadSentRequests();
  }
}

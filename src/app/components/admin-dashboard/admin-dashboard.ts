import { Component, inject, OnInit, signal } from '@angular/core';
import { Users } from '../../services/users';
import { User } from '../../models/user';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private usersService = inject(Users);

  // On utilise un Signal pour stocker la liste des chercheuses
  pendingUsers = signal<User[]>([]);

  ngOnInit() {
    this.loadPendingUsers();
  }

  loadPendingUsers() {
    this.usersService.getPendingUsers().subscribe({
      next: (users) => this.pendingUsers.set(users),
      error: (err) => console.error('Erreur de chargement', err),
    });
  }

  handleApprove(id: number) {
    this.usersService.approveUser(id).subscribe(() => {
      alert('Chercheuse approuvée !');
      this.loadPendingUsers(); // On rafraîchit la liste
    });
  }

  handleReject(id: number) {
    if (confirm('Voulez-vous vraiment rejeter cette inscription ?')) {
      this.usersService.rejectUser(id).subscribe({
        next: () => {
          alert('Demande supprimée.');
          this.loadPendingUsers(); // Recharge la liste
        },
        error: (err) => console.error(err),
      });
    }
  }
}

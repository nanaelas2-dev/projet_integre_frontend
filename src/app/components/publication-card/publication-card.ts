import { Component, computed, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { Categorie, Publication, PublicationRequest } from '../../models/publication';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicationService } from '../../services/publicationService';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { CommentService } from '../../services/commentService';
import { Commentaire } from '../../models/comment';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-publication-card',
  imports: [DatePipe, UpperCasePipe, ReactiveFormsModule, FormsModule],
  templateUrl: './publication-card.html',
  styleUrl: './publication-card.css',
})
export class PublicationCard implements OnInit {
  // Inputs/Outputs
  @Input({ required: true }) publication!: Publication;
  @Input({ required: true }) userId!: number; // Needed to rebuild DTO
  @Output() deleted = new EventEmitter<number>(); // Notify parent to remove from list

  private service = inject(PublicationService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private commentaireService = inject(CommentaireService);

  // State
  isEditing = signal(false);
  categories = Object.values(Categorie);
  
  // Comments state
  comments = signal<Commentaire[]>([]);
  showComments = signal(false);
  newComment = '';
  isLoadingComments = signal(false);

  ngOnInit() {
    this.loadComments();
  }

  // --- NEW COMMENT SIGNALS ---
  // Controls visibility (Is the comment box open or closed?)
  showComments = signal(false);
  // Stores the data (The list of comments from the database)
  comments = signal<Commentaire[]>([]);
  // UI Feedback (For slow internet)
  isLoadingComments = signal(false);
  // Form Input (What is the user typing right now?)
  newCommentText = signal('');

  // Computed Signal for Ownership
  isOwner = computed(() => {
    // Compare LoggedIn ID vs Author ID
    return this.userId === this.publication.utilisatrice.id;
  });

  // Helper to show initials
  getInitials(): string {
    const p = this.publication.utilisatrice.prenom.charAt(0);
    const n = this.publication.utilisatrice.nom.charAt(0);
    return (p + n).toUpperCase();
  }

  // Form
  editForm = this.fb.group({
    categorie: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    pieceJointe: [''],
  });

  // Toggle between View/Edit
  toggleEdit() {
    this.isEditing.set(!this.isEditing());
    if (this.isEditing()) {
      // patchValue allows to refill the text already present when editing
      this.editForm.patchValue({
        categorie: this.publication.categorie,
        description: this.publication.description,
        pieceJointe: this.publication.pieceJointe,
      });
    }
  }

  onSave() {
    if (this.editForm.valid) {
      const formVal = this.editForm.value;

      // Prepare DTO
      const request: PublicationRequest = {
        utilisatriceId: this.userId, // Keep same user
        description: formVal.description!,
        categorie: formVal.categorie as Categorie,
        pieceJointe: formVal.pieceJointe || '',
      };

      // Call Backend
      this.service.updatePublication(this.publication.id, request).subscribe({
        next: (updatedPub) => {
          // Update local view immediately
          this.publication = updatedPub;
          this.isEditing.set(false);
          alert('Publication modifiée !');
        },
        error: (err) => console.error(err),
      });
    }
  }

  onDelete() {
    if (confirm('Voulez-vous vraiment supprimer cette publication ?')) {
      this.service.deletePublication(this.publication.id).subscribe({
        next: () => {
          // Emit event so Dashboard removes it from the list
          this.deleted.emit(this.publication.id);
        },
        error: (err) => console.error(err),
      });
    }
  }

  // Comments methods
  loadComments() {
    this.isLoadingComments.set(true);
    this.commentService.getCommentsByPublication(this.publication.id).subscribe({
      next: (data) => {
        this.comments.set(data);
        this.isLoadingComments.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.isLoadingComments.set(false);
      },
    });
  }

  toggleComments() {
    this.showComments.set(!this.showComments());
  }

  addComment() {
    if (!this.newComment.trim()) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const request = {
      contenu: this.newComment.trim(),
      idUtilisateur: currentUser.id,
      idPublication: this.publication.id,
    };

    this.commentService.addComment(request).subscribe({
      next: (comment) => {
        this.comments.update(prev => [...prev, comment]);
        this.newComment = '';
      },
      error: (err) => console.error('Error adding comment:', err),
    });
  }

  deleteComment(commentId: number) {
    if (confirm('Voulez-vous supprimer ce commentaire ?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.comments.update(prev => prev.filter(c => c.id !== commentId));
        },
        error: (err) => console.error('Error deleting comment:', err),
      });
    }
  }

  getCommentAuthorInitials(comment: Commentaire): string {
    const prenom = comment.prenomUtilisateur || 'U';
    const nom = comment.nomUtilisateur || 'U';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }
}

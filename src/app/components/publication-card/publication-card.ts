import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import {
  Categorie,
  Publication,
  PublicationRequest,
  TypePieceJointe,
} from '../../models/publication';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicationService } from '../../services/publicationService';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Commentaire, CreateCommentaireRequest } from '../../models/commentaire';
import { CommentaireService } from '../../services/commentaireService';
import { SafeUrlPipe } from '../../pipes/safe-url-pipe';

@Component({
  selector: 'app-publication-card',
  imports: [DatePipe, UpperCasePipe, ReactiveFormsModule, FormsModule, SafeUrlPipe],
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

  Type = TypePieceJointe;

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

  // We need these to track if the user changes the file during edit
  editMode = signal<'FILE' | 'LINK'>('FILE');
  newFile = signal<File | null>(null);

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
    lien: [''],
  });

  // Toggle between View/Edit
  toggleEdit() {
    this.isEditing.set(!this.isEditing());
    if (this.isEditing()) {
      // patchValue allows to refill the text already present when editing
      this.editForm.patchValue({
        categorie: this.publication.categorie,
        description: this.publication.description,
      });

      // 2. Determine Initial Mode based on existing type
      const currentType = this.publication.type_piece_jointe;

      if (currentType === TypePieceJointe.IMAGE || currentType === TypePieceJointe.PDF) {
        this.editMode.set('FILE');
        this.newFile.set(null); // Null means "Keep existing file"
      } else if (
        currentType === TypePieceJointe.VIDEO_LINK ||
        currentType === TypePieceJointe.TEXT_LINK
      ) {
        this.editMode.set('LINK');
        // Pre-fill the link input with the current URL
        this.editForm.patchValue({ lien: this.publication.pieceJointe });
      }
    }
  }

  // Handle switching tabs in Edit Mode
  setEditMode(mode: 'FILE' | 'LINK') {
    this.editMode.set(mode);
    if (mode === 'FILE') this.editForm.patchValue({ lien: '' });
    if (mode === 'LINK') this.newFile.set(null);
  }

  // Handle file selection
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newFile.set(file);
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
        // Send File: Only if user picked a NEW one (otherwise null)
        fichier: this.newFile(),
        // Send Link: Only if in LINK mode and text is present
        lien: this.editMode() === 'LINK' ? formVal.lien || null : null
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

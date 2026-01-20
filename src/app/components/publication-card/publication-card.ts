import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
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

  // Services
  private service = inject(PublicationService);
  private commentaireService = inject(CommentaireService);
  private fb = inject(FormBuilder);

  // Constants
  Type = TypePieceJointe;
  categories = Object.values(Categorie);

  // --- STATE SIGNALS ---

  // Edit Mode
  isEditing = signal(false);
  editMode = signal<'FILE' | 'LINK'>('FILE');
  newFile = signal<File | null>(null);

  // Comment Mode
  showComments = signal(false);
  comments = signal<Commentaire[]>([]);
  isLoadingComments = signal(false);
  // Form Input (What is the user typing right now?)
  newCommentText = signal('');

  // Check if current user owns the publication
  isOwner = computed(() => {
    // Compare LoggedIn ID vs Author ID
    return this.userId === this.publication.utilisatrice.id;
  });

  // Form Configuration
  editForm = this.fb.group({
    categorie: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    lien: [''],
  });

  ngOnInit() {
    // We load comments initially to get the count for the badge
    this.loadComments();
  }

  // --- HELPERS ---

  getInitials(): string {
    const p = this.publication.utilisatrice.prenom.charAt(0);
    const n = this.publication.utilisatrice.nom.charAt(0);
    return (p + n).toUpperCase();
  }

  // Helper for Comment Author Initials (using nested user object)
  getCommentAuthorInitials(comment: Commentaire): string {
    const p = comment.utilisateur.prenom.charAt(0);
    const n = comment.utilisateur.nom.charAt(0);
    return (p + n).toUpperCase();
  }

  // Helper to check if current user owns a specific comment
  isCommentOwner(comment: Commentaire): boolean {
    return comment.utilisateur.id === this.userId;
  }

  // --- EDIT LOGIC ---

  // Toggle between View/Edit
  toggleEdit() {
    this.isEditing.set(!this.isEditing());
    if (this.isEditing()) {
      // patchValue allows to refill the text already present when editing
      this.editForm.patchValue({
        categorie: this.publication.categorie,
        description: this.publication.description,
      });

      // Determine Initial Mode based on existing type
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
          this.deleted.emit(this.publication.id);
        },
        error: (err) => console.error(err),
      });
    }
  }

  // --- COMMENT LOGIC ---

  toggleComments() {
    this.showComments.set(!this.showComments());
    // Refresh if opening and empty
    if (this.showComments() && this.comments().length === 0) {
      this.loadComments();
    }
  }

  loadComments() {
    this.isLoadingComments.set(true);
    this.commentaireService.getByPublication(this.publication.id).subscribe({
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

  addComment() {
    const content = this.newCommentText().trim();
    if (!content) return;

    const request: CreateCommentaireRequest = {
      contenu: content,
      idUtilisateur: this.userId,
      idPublication: this.publication.id,
    };

    this.commentaireService.create(request).subscribe({
      next: (comment) => {
        // Update the list immediately
        this.comments.update((prev) => [...prev, comment]);
        this.newCommentText.set(''); // Clear input
      },
      error: (err) => console.error('Error adding comment:', err),
    });
  }

  deleteComment(commentId: number) {
    if (confirm('Voulez-vous supprimer ce commentaire ?')) {
      this.commentaireService.delete(commentId).subscribe({
        next: () => {
          this.comments.update((prev) => prev.filter((c) => c.id !== commentId));
        },
        error: (err) => console.error('Error deleting comment:', err),
      });
    }
  }
}

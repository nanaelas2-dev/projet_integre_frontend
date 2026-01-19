import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Categorie, Publication, PublicationRequest } from '../../models/publication';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicationService } from '../../services/publicationService';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-publication-card',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './publication-card.html',
  styleUrl: './publication-card.css',
})
export class PublicationCard {
  // Inputs/Outputs
  @Input({ required: true }) publication!: Publication;
  @Input({ required: true }) userId!: number; // Needed to rebuild DTO
  @Output() deleted = new EventEmitter<number>(); // Notify parent to remove from list

  private service = inject(PublicationService);
  private fb = inject(FormBuilder);

  // State
  isEditing = signal(false);
  categories = Object.values(Categorie);

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
}

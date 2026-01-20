export enum Categorie {
  FORMATION = 'FORMATION',
  ACHIEVEMENT = 'ACHIEVEMENT',
}

export interface Author {
  id: number;
  nom: string;
  prenom: string;
}

export interface Publication {
  id: number;
  description: string;
  pieceJointe: string;
  categorie: Categorie;
  datePublication?: string;

  utilisatrice: Author;
  type_piece_jointe: TypePieceJointe;
}

export enum TypePieceJointe {
  TEXT_LINK = 'TEXT_LINK',
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  VIDEO_LINK = 'VIDEO_LINK'
}

export interface PublicationRequest {
  utilisatriceId: number;
  description: string;
  lien: string | null;
  categorie: Categorie;
  fichier: File | null;
}

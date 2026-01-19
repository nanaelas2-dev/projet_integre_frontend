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
}

export interface PublicationRequest {
  utilisatriceId: number;
  description: string;
  pieceJointe: string;
  categorie: Categorie;
}

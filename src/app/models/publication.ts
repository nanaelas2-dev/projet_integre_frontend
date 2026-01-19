export enum Categorie {
  FORMATION = 'FORMATION',
  ACHIEVEMENT = 'ACHIEVEMENT',
}

export interface PublicationRequest {
  utilisatriceId: number;
  description: string;
  pieceJointe: string;
  categorie: Categorie;
}

export interface Publication {
  id: number;
  description: string;
  pieceJointe: string;
  categorie: Categorie;
  datePublication?: string;
}

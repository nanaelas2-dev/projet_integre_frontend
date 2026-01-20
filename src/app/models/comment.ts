export interface Commentaire {
  id: number;
  contenu: string;
  idUtilisateur: number;
  idPublication: number;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
  dateCreation?: string;
}

export interface CommentaireRequest {
  contenu: string;
  idUtilisateur: number;
  idPublication: number;
}

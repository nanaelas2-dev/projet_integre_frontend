import { User } from './user';

export interface Commentaire {
  id: number;
  contenu: string;
  createdAt: string;
  utilisateur: User;
}

export interface CreateCommentaireRequest {
  contenu: string;
  idUtilisateur: number;
  idPublication: number;
}

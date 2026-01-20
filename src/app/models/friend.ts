// Friend request status enum
export type FriendRequestStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

// DTO for friend requests
export interface FriendRequestDTO {
  id: number;
  expeditriceId: number;
  expeditriceNom: string;
  expeditricePrenom: string;
  destinataireId: number;
  destinataireNom: string;
  destinatairePrenom: string;
  statut: FriendRequestStatus;
  dateEnvoi: string;
  dateReponse: string | null;
}

// DTO for friends list
export interface AmieDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  description?: string;
}

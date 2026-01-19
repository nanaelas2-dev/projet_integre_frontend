// DTO for sending messages
export interface EnvoyerMessageRequest {
  expeditricId: number;
  destinataireId: number;
  contenu: string;
}

// DTO for received messages
export interface MessageDTO {
  id: number;
  conversationId: number;
  expeditricId: number;
  expeditricNom: string;
  contenu: string;
  dateEnvoi: string;
  lu: boolean;
}

// DTO for conversation list
export interface ConversationDTO {
  id: number;
  autreParticipanteId: number;
  autreParticipanteNom: string;
  dernierMessage: string;
  dernierMessageDate: string;
  nonLus: number;
}

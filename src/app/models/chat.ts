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
  expeditriceNom: string;
  expeditricePrenom: string;
  contenu: string;
  dateEnvoi: string;
  lu: boolean;
}

// DTO for conversation list
export interface ConversationDTO {
  id: number;
  autreParticipanteId: number;
  autreParticipanteNom: string;
  autreParticipantePrenom: string;
  dernierMessage: string;
  dernierMessageDate: string;
  messagesNonLus: number;
}

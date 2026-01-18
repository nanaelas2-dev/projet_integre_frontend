export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string; // "ADMINISTRATEUR" ou "INSCRITE"
  confirmed: boolean;
  telephone?: string; // Le '?' signifie optionnel
  description?: string;
  cin: string;
}

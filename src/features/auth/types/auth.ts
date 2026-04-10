// ============================================================
// Centralized Auth Types
// ============================================================

export type AuthResult = {
  success: boolean;
  error?: string;
  redirect?: string;
};

export type StrengthResult = {
  score: number;
  checks: {
    length: boolean;
    lower: boolean;
    upper: boolean;
    number: boolean;
  };
};

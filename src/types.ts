export type StatusKind = 'idle' | 'info' | 'success' | 'error';

export interface FormStatus {
  kind: StatusKind;
  message: string;
}

export type ServerTargetMode = 'localhost' | 'maya327' | 'custom';

export interface ApiConfig {
  serverTarget: ServerTargetMode; // 'localhost' by default
  customEndpoint: string;
  apiKey: string;
  csrfToken: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  verified?: boolean;
  magicLink?: string;
  raw?: string;
  preview?: string;
  source?: string;
}

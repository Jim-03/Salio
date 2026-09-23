export interface SystemData {
  addresses: Address[]; // Inbox addresses
  lastImport: number | null; // Last transaction's timestamp if provided
}

export interface Address {
  id: number;
  name: string;
  description: string;
}

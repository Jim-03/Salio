export interface SystemData {
  addresses: Address[]; // Inbox addresses
  lastImport: number | null; // Last transaction's timestamp if provided
  transactions: Set<Transaction>;
}

export interface Address {
  id: number;
  name: string;
  description: string;
}

export interface Transaction {
  id: string;
  address_id: number;
  code: string;
  amount: number;
  vendor: string | null;
  recipient: string | null;
  timestamp: number;
  balance: number;
  cost: number;
  action: string;
  sms: string;
}

export interface HomeData {
  balance: number;
  last_5_transactions: Transaction[];
  income: number;
  expense: number;
}

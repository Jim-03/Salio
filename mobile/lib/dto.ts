export interface SystemData {
  addresses: Address[]; // Inbox addresses
  lastImport: number | null; // Last transaction's timestamp if provided
  // TODO: Modify to maps
  transactions: Set<Transaction>;
  categories: Map<number, Category>;
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
  category_id: number;
  autocategorized: boolean;
}

export interface HomeData {
  balance: number;
  last_5_transactions: Transaction[];
  income: number;
  expense: number;
}

export interface HistoryData {
  number_of_elements: number;
  transactions: Transaction[];
  page: number;
  income: number;
  expense: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Filters {
  limit: number;
  start?: number;
  end?: number;
  search_term?: string;
  page: number;
  direction: TransactionDirection;
  category: number | "ALL" | "UNKNOWN";
}

export enum TransactionDirection {
  ALL = "ALL",
  INCOME = "INCOME",
  SPENT = "SPENT",
}

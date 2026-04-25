import { TransactionDetails } from "@/utils/regex-parser";
import { SQLiteDatabase } from "expo-sqlite";

export interface NewTransaction extends TransactionDetails {
  timestamp: string;
  category: string;
  message: string;
}

export interface TransactionRecord {
  id: number;
  reference_number: string;
  merchant: string;
  transaction_timestamp: string;
  amount: number;
  balance: number;
  transaction_cost: number;
  direction: "IN" | "OUT";
  is_paybill: 1 | 0;
  is_send_money: 1 | 0;
  is_buy_goods: 1 | 0;
  is_reversal: 1 | 0;
  category: string;
}

/**
 * Add new transactions to the database
 * @param {SQLiteDatabase} db SQLite instance
 * @param {NewTransaction[]} transactions A list of transactions to be added
 * @returns {Promise<void>} A promise that resolves once the transactions are added
 */
export async function addToDatabase(
  db: SQLiteDatabase,
  transactions: NewTransaction[],
): Promise<void> {
  await db.withExclusiveTransactionAsync(async (tx) => {
    // Prepare a statement to be used in a single transaction
    const preparedStatement = await tx.prepareAsync(`
        INSERT OR IGNORE INTO transactions
        (reference_number, merchant, transaction_timestamp, amount,
         transaction_cost, direction, is_paybill, is_send_money, is_buy_goods,
         is_reversal, balance, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      for (const t of transactions) {
        // Execute the prepared statement for each transaction in the batch
        await preparedStatement.executeAsync([
          t.message.split(/\s/)[0],
          t.merchant.toUpperCase(),
          t.timestamp,
          t.amount,
          t.transactionCost,
          t.incoming === 1 ? "IN" : "OUT",
          t.isPayBill,
          t.isSendMoney,
          t.isBuyGoods,
          t.isReversal,
          t.balance,
          t.category,
        ]);
      }
    } catch (error) {
      console.error("Batch failed, rolled back:", error);
      throw error;
    } finally {
      await preparedStatement.finalizeAsync();
    }
  });
}

/**
 * Get the latest saved transaction's timestamp
 * @param {SQLiteDatabase} db SQLite instance
 * @returns {number} Timestamp or 0 in case no data exists
 */
export async function getLastTransactionDate(
  db: SQLiteDatabase,
): Promise<number> {
  const data = await db.getFirstAsync<{ transaction_timestamp: string }>(`
      SELECT transaction_timestamp
      from transactions
      ORDER BY transaction_timestamp DESC
      LIMIT 1
  `);

  if (data) {
    return Number(data.transaction_timestamp);
  }
  return 0;
}

/**
 * Retrieve the last stored balance
 * @param {SQLiteDatabase} db SQLite instance
 * @returns {Promise<number>} A promise that resolves to the balance
 */
export async function getLatestBalance(db: SQLiteDatabase) {
  const data = await db.getFirstAsync<{ balance: string }>(`
    SELECT balance FROM transactions
    ORDER BY transaction_timestamp DESC
    LIMIT 1
    `);

  if (data) {
    return Number(data.balance);
  }
  return 0;
}

/**
 * Retrieve income and expense of the current month
 * @param {SQLiteDatabase} db SQLite instance
 * @returns {Promise<{income: number, expense: number}>} A promise that resolves to the income and expense of the current month
 */
export async function getMonthlyOverview(db: SQLiteDatabase) {
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  const incomeData = await db.getFirstAsync<{ total_amount: number }>(`
    SELECT SUM(amount) as total_amount FROM transactions
    WHERE direction = "IN" AND transaction_timestamp > ${Number(startOfMonth)}
    `);
  const expenseData = await db.getFirstAsync<{ total_amount: number }>(`
    SELECT SUM(amount) + SUM(transaction_cost) as total_amount FROM transactions
    WHERE direction = "OUT" AND transaction_timestamp > ${Number(startOfMonth)}
    `);
  if (!incomeData || !expenseData) {
    return {
      income: 0,
      expense: 0,
    };
  }
  return {
    income: incomeData.total_amount,
    expense: expenseData.total_amount,
  };
}

/**
 * Retrieve the total expense of the past 6 days
 * @param {SQLiteDatabase} db SQLite instance
 * @returns {Promise<Record<string: number>>} A promise that results to an object containing a list of the past 6 days and their total expenses
 */
export async function getLast6DayExpense(db: SQLiteDatabase) {
  const now = new Date();
  const data: Record<string, number> = {};
  const days = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - i); // JS safely handles month/year boundaries here

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayData = await db.getFirstAsync<{ total_amount: number | null }>(`
      SELECT (SUM(amount) + SUM(transaction_cost)) AS total_amount 
      FROM transactions
      WHERE direction = "OUT" 
      AND transaction_timestamp BETWEEN ${Number(startOfDay)} AND ${Number(endOfDay)}
    `);

    data[days[targetDate.getDay()]] = dayData?.total_amount || 0;
  }
  return data;
}

/**
 * Retrieve the last 5 transactions
 * @param {SQLiteDatabase} db SQLite instance
 * @returns {Promise<{
    merchant: string;
    transaction_timestamp: number;
    amount: number;
    transaction_cost: number;
    direction: "IN" | "OUT";
  }[]>} A promise that resolves to a summary of the last 5 saved transactions
 */
export async function getLast5Transactions(db: SQLiteDatabase) {
  return await db.getAllAsync<TransactionRecord>(`
  SELECT merchant, transaction_timestamp, amount, transaction_cost, direction FROM transactions
  ORDER BY transaction_timestamp DESC
  LIMIT 5
  `);
}

/**
 * Retrieve training data spanning from the last 3 months
 * @param db SQLite instance
 * @returns {Promise<{number[][], string[]}>} A promise that resolves to a matrix of records and an array of categories
 */
export async function getTrainingData(db: SQLiteDatabase) {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const transactions = await db.getAllAsync<TransactionRecord>(
    `
    SELECT * FROM transactions 
    WHERE transaction_timestamp > ? AND category IS NOT NULL
  `,
    [Number(threeMonthsAgo)],
  );

  const Xtrain: number[][] = [];
  const Ytrain: string[] = [];

  for (const t of transactions) {
    const date = new Date(Number(t.transaction_timestamp));

    const features = [
      date.getHours(),
      date.getDay(),
      date.getDate(),
      date.getMonth(),
      Number(t.amount) || 0,
      Number(t.transaction_cost) || 0,
      t.is_paybill ? 1 : 0,
      t.is_send_money ? 1 : 0,
      t.is_buy_goods ? 1 : 0,
      t.is_reversal ? 1 : 0,
      t.direction === "IN" ? 1 : 0,
    ];

    Xtrain.push(features);
    Ytrain.push(t.category);
  }

  return { Xtrain, Ytrain };
}

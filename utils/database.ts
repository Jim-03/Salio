import { TransactionDetails } from "@/utils/regex-parser";
import { SQLiteDatabase } from "expo-sqlite";

export interface NewTransaction extends TransactionDetails {
  timestamp: string;
  category: string;
  message: string;
  isAiCategorized: 0 | 1
}

export interface TransactionFilters {
  merchant: string | "ALL";
  category: string | "ALL";
  direction: "IN" | "OUT" | "ALL";
  sort: "HIGHEST AMOUNT" | "LEAST AMOUNT" | "LATEST" | "OLDEST";
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
  is_ai_categorized: 0 | 1
}

export interface CategoryExpense {
  category: string;
  total_expense: string;
}

export interface MonthlyOverview {
  month: string;
  total_expense: number;
  total_income: number;
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
         is_reversal, balance, category, is_ai_categorized)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            t.isAiCategorized
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
 * @param {SQLiteDatabase} db SQLite instance
 * @returns {Promise<{Xtrain: number[][], Ytrain: number[], categories: string[]}>}
 */
export async function getTrainingData(db: SQLiteDatabase): Promise<{
  Xtrain: number[][];
  Ytrain: number[];
  categories: string[];
}> {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const transactions = await db.getAllAsync<TransactionRecord>(
    `
          SELECT * FROM transactions
          WHERE transaction_timestamp > ? AND category IS NOT NULL AND category IS NOT 'UNKNOWN'
      `,
    [Number(threeMonthsAgo)],
  );

  const Xtrain: number[][] = [];
  const Ytrain: number[] = [];

  const categoryMap: Record<string, number> = {};
  const categories: string[] = [];
  let classId = 0;

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

    if (categoryMap[t.category] === undefined) {
      categoryMap[t.category] = classId;
      categories.push(t.category);
      classId++;
    }

    Xtrain.push(features);
    Ytrain.push(categoryMap[t.category]);
  }

  return { Xtrain, Ytrain, categories };
}

/**
 * Retrieve all transactions satisfying filters
 * @param {SQLiteDatabase} db SQLite instance
 * @param {TransactionFilters} filters Filters object for searching purposes
 * @param {number} offset Number of records to skip
 * @returns {Promise<TransactionRecord[]>} A promise that resolves to an array of transaction records
 */
export async function getAllTransactions(
  db: SQLiteDatabase,
  filters: TransactionFilters,
  offset: number,
): Promise<TransactionRecord[]> {
  const category = filters.category === "ALL" ? "%" : `%${filters.category}%`;
  const direction = filters.direction === "ALL" ? "%" : filters.direction;
  const merchant = filters.merchant === "ALL" ? "%" : `%${filters.merchant}%`;
  const orderBy = filters.sort
    ? filters.sort.endsWith("AMOUNT")
      ? "amount"
      : "transaction_timestamp"
    : "transaction_timestamp";
  const order =
    filters.sort === "LATEST" || filters.sort === "HIGHEST AMOUNT"
      ? "DESC"
      : "ASC";

  return await db.getAllAsync<TransactionRecord>(
    `
      SELECT * FROM transactions
      WHERE category LIKE ?
        AND direction LIKE ?
        AND merchant LIKE ?
      ORDER BY ${orderBy} ${order}
      LIMIT 20
          OFFSET ?
  `,
    [category, direction, merchant, offset],
  );
}

/**
 * Update transaction details
 * @param {SQLiteDatabase} db SQLite instance
 * @param {number} id transaction primary key
 * @param {boolean} applyAll determiner if all transactions under the same merchant should be updated
 * @param {string} merchant Merchant name
 * @param {string} category New category name
 * @returns {Promise<void>} A promise that resolves when the transaction is updated
 */
export async function updateTransaction(
  db: SQLiteDatabase,
  id: number,
  applyAll: boolean,
  merchant: string,
  category: string,
): Promise<void> {
  if (applyAll) {
    await db.runAsync(
      `
        UPDATE transactions
        SET category = ?
        WHERE merchant = ?`,
      [category, merchant],
    );
  } else {
    await db.runAsync(
      `
        UPDATE transactions
        SET category = ?
        WHERE id = ?
    `,
      [category, id],
    );
  }
}

/**
 * Retrieve expense by category in a specified period
 * @param {SQLiteDatabase} db SQLite instance
 * @param {number} startDate Start date in milliseconds
 * @param {number} endDate End date in milliseconds
 * @returns {Promise<CategoryExpense[]>} A promise that resolves to an array of categories and their total expense
 */
export async function getCategoryExpense(
  db: SQLiteDatabase,
  startDate: number,
  endDate: number,
): Promise<CategoryExpense[]> {
  return await db.getAllAsync<CategoryExpense>(
    `
  SELECT SUM(amount) + SUM(transaction_cost) AS total_expense, category FROM transactions
  WHERE transaction_timestamp BETWEEN ? AND ? AND direction = 'OUT'
  GROUP BY category
  `,
    [startDate.toString(), endDate.toString()],
  );
}

/**
 * Retrieve the total income/expense in a specified period
 * @param {SQLiteDatabase} db SQLite instance
 * @param {number} startDate Start date in milliseconds
 * @param {number} endDate End date in milliseconds
 * @returns {Promise<{income: number, expense: number}>} A promise that resolves to the total income & expense
 */
export async function getCashFlowOverView(
  db: SQLiteDatabase,
  startDate: number,
  endDate: number,
): Promise<{ income: number; expense: number }> {
  const start = startDate.toString();
  const end = endDate.toString();
  const incomeData = await db.getFirstAsync<{ total_amount: number }>(
    `
  SELECT SUM(amount) AS total_amount FROM transactions
  WHERE transaction_timestamp BETWEEN ? AND ? AND direction = 'IN'
  `,
    [start, end],
  );
  const expenseData = await db.getFirstAsync<{ total_amount: number }>(
    `
  SELECT SUM(amount) + SUM(transaction_cost) AS total_amount FROM transactions
  WHERE transaction_timestamp BETWEEN ? AND ? AND direction = 'OUT'
  `,
    [start, end],
  );

  return {
    income: incomeData?.total_amount || 0,
    expense: expenseData?.total_amount || 0,
  };
}

/**
 * Retrieve the total income & expense pre month in a specified period
 * @param {SQLiteDatabase} db SQLite instance
 * @param {number} startDate Start date in milliseconds
 * @param {number} endDate End date in milliseconds
 * @returns {Promise<MonthlyOverview[]>} A promise that resolves to an array of monthly income and expense
 */
export async function getMonthlyReview(
  db: SQLiteDatabase,
  startDate: Date,
  endDate: Date,
): Promise<MonthlyOverview[]> {
  // Only need boundaries for the entire period
  const startOfPeriod = new Date(startDate.getTime());
  startOfPeriod.setDate(1);
  startOfPeriod.setHours(0, 0, 0, 0);

  const endOfPeriod = new Date(endDate.getTime());
  endOfPeriod.setHours(23, 59, 59, 999);

  // One single query to fetch all months grouped together
  return await db.getAllAsync<MonthlyOverview>(
    `
      SELECT
          strftime('%Y-%m', CAST(transaction_timestamp AS INTEGER) / 1000, 'unixepoch') AS month,

          -- Calculate OUT totals (Expenses)
          SUM(CASE WHEN direction = 'OUT' THEN amount + transaction_cost ELSE 0 END) AS total_expense,

          -- Calculate IN totals (Income)
          SUM(CASE WHEN direction = 'IN' THEN amount ELSE 0 END) AS total_income

      FROM transactions
      WHERE transaction_timestamp BETWEEN ? AND ?
      GROUP BY month
      ORDER BY month ASC
  `,
    [startOfPeriod.getTime().toString(), endOfPeriod.getTime().toString()],
  );
}

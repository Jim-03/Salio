import * as SQLite from "expo-sqlite";
import { message } from "./classifier";
import { Filters } from "../screens/review";

export interface TransactionRecord extends message {
  direction: "IN" | "OUT";
  transaction_time: string;
  transaction_date: string;
  id: number;
  message: string;
  category: string;
  transaction_timestamp: number;
}

/**
 * Retrieves the transaction type based on the message features
 * @param m Message features
 * @returns {string}Transaction type
 */
function getTransactionType(m: message): string {
  if (m.isWithdraw === 1) {
    return "Withdrawal";
  } else if (m.isBuyGoods === 1) {
    return "Buy Goods and Services";
  } else if (m.isPayBill === 1) {
    return "Paybill";
  } else if (m.isSendMoney === 1) {
    return "Send Money";
  } else if (m.isReversal === 1) {
    return "Reversal";
  }
  return "Unknown";
}

/**
 * Adds new transaction records to the database
 * @param db {SQLite.SQLiteDatabase} SQLite instance
 * @param newMessages {TransactionRecord} List of new transactions features
 */
export const storeNewMessages = async (
  db: SQLite.SQLiteDatabase,
  newMessages: TransactionRecord[],
) => {
  await db.withExclusiveTransactionAsync(async (tx) => {
    const preparedStatement = await tx.prepareAsync(`
            INSERT OR IGNORE INTO transactions
            (transaction_code, merchant, transaction_type, transaction_date, transaction_time, amount, transaction_cost,
             direction, message, category, transaction_timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)
        `);

    try {
      let inserted = 0;
      for (const transaction of newMessages) {
        const dateTime = new Date(transaction.transaction_timestamp);

        const result = await preparedStatement.executeAsync([
          transaction.message.split(" ")[0],
          transaction.merchant,
          getTransactionType(transaction),
          dateTime.toLocaleDateString("en-KE"),
          dateTime.toLocaleTimeString("en-KE"),
          transaction.amount,
          transaction.transactionCost,
          transaction.incoming === 1 ? "IN" : "OUT",
          transaction.message,
          transaction.category,
          transaction.transaction_timestamp,
        ]);

        inserted += result.changes;
      }
      console.log(`Successfully added ${inserted} transactions`);
    } catch (e) {
      console.error("An error has occurred while adding the transactions: ", e);
      throw e;
    } finally {
      await preparedStatement.finalizeSync();
    }
  });
};

/**
 * Retrieves the date of the very last transaction
 * @param db {SQLite.SQLiteDatabase} SQLite instance
 * @returns {Promise<Date>} Promise that resolves to the date of the last transaction or null in case the latest transaction isn't found
 */
export const getLastTransactionDate = async (
  db: SQLite.SQLiteDatabase,
): Promise<Date | null> => {
  try {
    const transaction = (await db.getFirstAsync(`
        SELECT transaction_timestamp
        FROM transactions
        ORDER BY transaction_timestamp DESC
        LIMIT 1
    `)) as { transaction_timestamp: number };

    if (!transaction || !transaction.transaction_timestamp) return null;

    return new Date(transaction.transaction_timestamp);
  } catch (e) {
    console.error("An error has occurred while retrieving the last date: ", e);
    return null;
  }
};

/**
 * Retrieves the user's MPESA balance
 * @param db {SQLite.SQLiteDatabase} SQLite instance
 * @returns User's MPESA balance
 */
export const getLastBalance = async (
  db: SQLite.SQLiteDatabase,
): Promise<number> => {
  const result = (await db.getFirstAsync(`
    SELECT message FROM transactions
    ORDER BY transaction_timestamp DESC
    LIMIT 1
    `)) as { message: string };
  const balanceMatch = result.message.match(
    /.*balance is Ksh([\d,]+\.\d{1,2})/,
  );
  return balanceMatch ? Number(balanceMatch[1].replace(",", "")) : 0;
};

/**
 * Retrieves the user's total income in a year
 * @param db {SQLite.SQLiteDatabase} SQLite database instance
 * @param year Year to be summed
 * @returns {Promise<number>} A promise that resolves to the total income
 */
export const getTotalIncomePerYear = async (
  db: SQLite.SQLiteDatabase,
  year = new Date().getFullYear(),
): Promise<number> => {
  const amount = (await db.getFirstAsync(`
    SELECT SUM(amount) AS total FROM transactions
    WHERE transaction_date LIKE '%${year}' AND direction='IN'
    `)) as { total: number };
  return amount.total;
};

/**
 * Retrieves the user's total expense in a year
 * @param db {SQLite.SQLiteDatabase} SQLite database instance
 * @param year Year to be summed
 * @returns {Promise<number>} A promise that resolves to the total expense
 */
export const getTotalExpensePerYear = async (
  db: SQLite.SQLiteDatabase,
  year = new Date().getFullYear(),
): Promise<number> => {
  const amount = (await db.getFirstAsync(`
    SELECT SUM(amount) AS total FROM transactions
    WHERE transaction_date LIKE '%${year}' AND direction='OUT'
    `)) as { total: number };
  return amount.total;
};

/**
 * Retrieves the category most spent on in the current month
 * @param db SQLite instance
 * @returns {Promise<string>} A promise that resolves to the category name
 */
export const getMonthlyExpense = async (
  db: SQLite.SQLiteDatabase,
): Promise<string> => {
  const todayDate = new Date();
  const currentMonth = String(todayDate.getMonth() + 1).padStart(2, "0");
  const currentYear = todayDate.getFullYear();

  const result = (await db.getFirstAsync(`
      SELECT sum(amount) AS total_amount, category
      FROM transactions
      WHERE transaction_date LIKE '%/${currentMonth}/${currentYear}%'
        AND direction = 'OUT'
      GROUP BY category
      ORDER BY total_amount DESC
  `)) as { category: string; totalAmount: number };
  return result.category.replace("AI_", "");
};

/**
 * Retrieves the average amount of money being sent in the current month
 * @param db SQLite instance
 * @returns {Promise<number>} A promise that resolves to the monthly average
 */
export const getMonthlyAverageUsage = async (
  db: SQLite.SQLiteDatabase,
): Promise<number> => {
  const todayDate = new Date();
  const currentMonth = String(todayDate.getMonth() + 1).padStart(2, "0");
  const currentYear = todayDate.getFullYear();

  const result = (await db.getFirstAsync(`
      SELECT AVG(amount) AS average_usage
      FROM transactions
      WHERE transaction_date LIKE '%/${currentMonth}/${currentYear}'
        AND direction = 'OUT'
  `)) as { average_usage: number };
  return result.average_usage;
};

/**
 * Retrieve last 5 transactions
 * @param db SQLite database instance
 */
export const getLast5Transactions = async (db: SQLite.SQLiteDatabase) => {
  return (await db.getAllAsync(`
      SELECT *
      FROM transactions
      ORDER BY transaction_timestamp DESC
      LIMIT 5
  `)) as TransactionRecord[];
};

/**
 * Retrieve a paginated list of all transactions
 * @param db SQLite database instance
 * @param offset Number of rows to skip
 * @param sort Sort direction
 */
/**
 * Retrieve a paginated list of all transactions
 * @param db SQLite database instance
 * @param offset Number of rows to skip
 * @param sortBy {"Highest Amount" | "Least Amount" | "Latest" | "Oldest"} Direction to sort transactions
 * @param filters Object that contains transaction filters
 */
export const getAllTransactions = async (
  db: SQLite.SQLiteDatabase,
  offset: number,
  sortBy: string,
  filters: Filters,
) => {
  const sort =
    sortBy.includes("Highest") || sortBy === "Latest" ? "DESC" : "ASC";
  const category =
    filters.category === "ALL"
      ? "%"
      : filters.category === "AI"
        ? "AI_%"
        : `%${filters.category}`;
  const direction = filters.direction === "ALL" ? "%" : filters.direction;
  const sortCriteria = sortBy.includes("Amount")
    ? "amount"
    : "transaction_timestamp";
  const merchant = filters.searchTerm ? `%${filters.searchTerm.trim()}%` : "%";

  return (await db.getAllAsync(
    `
      SELECT *
      FROM transactions
      WHERE UPPER(merchant) LIKE UPPER(?) AND category LIKE UPPER(?) AND direction LIKE ?
      ORDER BY ${sortCriteria} ${sort}
      LIMIT 10 OFFSET ?
  `,
    [merchant, category, direction, offset],
  )) as TransactionRecord[];
};

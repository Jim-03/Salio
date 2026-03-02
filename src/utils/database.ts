import * as SQLite from "expo-sqlite";
import { message } from "./classifier";
import { getDateFromString } from "./date";

export interface TransactionRecord extends message {
  id: number;
  message: string;
  category: string;
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
            INSERT INTO transactions
            (transaction_code, merchant, transaction_type, transaction_date, transaction_time, amount, transaction_cost,
             direction, message, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

    try {
      for (const transaction of newMessages) {
        const dateTime = getDateFromString(
          transaction.date as string,
          transaction.time as string,
        );

        await preparedStatement.executeAsync([
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
        ]);
      }
      console.log(`Successfully added ${newMessages.length} transactions`);
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
 * @returns {Promise<Date>} Promise that resolves to the date of the last transaction
 */
export const getLastTransactionDate = async (
  db: SQLite.SQLiteDatabase,
): Promise<Date> => {
  const transaction = (await db.getFirstAsync(`
    SELECT transaction_date, transaction_time FROM transactions
    ORDER BY id DESC
    LIMIT 1
    `)) as { transaction_date: string; transaction_time: string };

  return getDateFromString(
    transaction.transaction_date,
    transaction.transaction_time,
  );
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
    ORDER BY id DESC
    LIMIT 1
    `)) as { message: string };
  const balanceMatch = result.message.match(
    /.*balance is Ksh([\d,]+\.\d{1,2})/,
  );
  return balanceMatch ? Number(balanceMatch[1]) : 0;
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

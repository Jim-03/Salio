import * as SQLite from "expo-sqlite";
import { message } from "./classifier";
import { getDateFromString } from "./date";

export interface TransactionRecord extends message {
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

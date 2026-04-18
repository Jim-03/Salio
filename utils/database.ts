import { TransactionDetails } from "@/utils/regex-parser";
import { SQLiteDatabase } from "expo-sqlite";

export interface NewTransaction extends TransactionDetails {
  timestamp: string;
  category: string;
  message: string;
}

const BATCH_SIZE = 500;

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
         is_reversal, balance)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        ]);
      }
      await preparedStatement.executeAsync("COMMIT"); // Commit the current transaction
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
export function getLastTransactionDate(db: SQLiteDatabase): number {
  const data = db.getFirstSync<{ transaction_timestamp: string; }>(`
      SELECT transaction_timestamp
      from transactions
      ORDER BY transaction_timestamp DESC
      LIMIT 1
  `)

  if (data) {
    return Number(data.transaction_timestamp)
  }
  return 0
}

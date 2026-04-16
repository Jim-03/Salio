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
  if (transactions.length === 0) return;

  // Prepare a statement to be used in a single transaction
  const statement = await db.prepareAsync(`
    INSERT OR IGNORE INTO transactions 
    (reference_number, merchant, transaction_timestamp, amount, transaction_cost, direction, isPaybill, isSendMoney, isBuyGoods, isReversal) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let counter = 0; // Counter for batches

  try {
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      // Batch processing
      const batch = transactions.slice(i, i + BATCH_SIZE); // Create a copy of a batch size from the original array
      console.log(`Processing batch #${counter}`);
      await db.execAsync("BEGIN TRANSACTION"); // Start a single transaction

      try {
        for (const t of batch) {
          // Execute the prepared statement for each transaction in the batch
          await statement.executeAsync([
            t.message.split(/\s/)[0],
            t.merchant,
            t.timestamp,
            t.amount,
            t.transactionCost,
            t.incoming === 1 ? "IN" : "OUT",
            t.isPayBill,
            t.isSendMoney,
            t.isBuyGoods,
            t.isReversal,
          ]);
        }
        await db.execAsync("COMMIT"); // Commit the current transaction
      } catch (batchError) {
        await db.execAsync("ROLLBACK"); // Rollback in case of an error
        console.error("Batch failed, rolled back:", batchError);
        throw batchError;
      }
      counter++;
    }
  } finally {
    await statement.finalizeAsync(); // Release memory
  }
}

export interface TransactionDetails {
  merchant: string;
  date: string;
  time: string;
  amount: number;
  isPayBill: 1 | 0;
  isBuyGoods: 1 | 0;
  isSendMoney: 1 | 0;
  isReversal: 1 | 0;
  isWithdraw: 1 | 0;
  transactionCost: number;
  incoming: 1 | 0;
}

/**
 * Extract the key details of a transaction in JSON-format
 * @param {string} message Message body
 * @returns {TransactionDetails} A Transaction in JSON format
 */
const extractTransactionDetails = (message: string): TransactionDetails => {
  const merchantMatch =
    message.match(
      /.*?\s(?:from|sent to|paid to|bought Ksh[\d,]+\.\d{1,2} of) (.*) on \d{1,2}\/\d{1,2}\/\d{1,2} at/,
    ) ||
    message.match(/ confirmed\. (.*) of transaction/) ||
    message.match(/[AP]MWithdraw Ksh[\d,]+\.\d{1,2} from (.*) New/);
  const dateMatch = message.match(
    /on (\d{1,2}\/\d{1,2}\/\d{1,2})\s*at \d{1,2}:\d{1,2} [AP]M/,
  );
  const timeMatch = message.match(
    /on \d{1,2}\/\d{1,2}\/\d{1,2}\s*at (\d{1,2}:\d{1,2} [AP]M)/,
  );
  const amountMatch =
    message.match(
      /.*[cC]onfirmed\.\s*(?:You have received\s|You bought\s)?Ksh([\d,]+\.\d{1,2}) (?:paid to|sent to)?/,
    ) || message.match(/[AP]MWithdraw\s+Ksh([\d,]+\.\d{1,2})/);
  const payBillMatch = message.match(
    /.*Ksh[\d,]+\.\d{1,2} sent to .* for .* on \d{1,2}\/\d{1,2}\/\d{2,4}/,
  );
  const buyGoodsMatch = message.match(
    /.*Ksh[\d,]+\.\d{1,2} paid to .* on \d{1,2}\/\d{1,2}\/\d{2,4}/,
  );
  const sendMoneyMatch = message.match(/(?:from|sent to) .* [\d{8, 10}]+\s+/);
  const reversalMatch = message.match(/ confirmed. Reversal of/);
  const withdrawMatch = message.match(/[AP]MWithdraw/);
  const transactionCostMatch = message.match(
    / Ksh[\d,]+\.\d{1,2}\. Transaction cost, Ksh([\d,]+\.\d{1,2})\. /,
  );
  const directionMatch = message.match(
    /sent to|paid to|debited from|[AP]MWithdraw|You bought/,
  );

  return {
    merchant: merchantMatch ? merchantMatch[1] : "",
    date: dateMatch ? dateMatch[1] : "",
    time: timeMatch ? timeMatch[1] : "",
    amount: amountMatch ? parseFloat(amountMatch[1].replace(",", "")) : 0.0,
    isPayBill: payBillMatch ? 1 : 0,
    isBuyGoods: !payBillMatch && buyGoodsMatch ? 1 : 0,
    isSendMoney: !payBillMatch && !buyGoodsMatch && sendMoneyMatch ? 1 : 0,
    isReversal:
      !payBillMatch && !buyGoodsMatch && !sendMoneyMatch && reversalMatch
        ? 1
        : 0,
    isWithdraw:
      !payBillMatch &&
      !buyGoodsMatch &&
      !sendMoneyMatch &&
      !reversalMatch &&
      withdrawMatch
        ? 1
        : 0,
    transactionCost: transactionCostMatch
      ? parseFloat(transactionCostMatch[1].replace(",", ""))
      : 0.0,
    incoming: directionMatch ? 0 : 1,
  };
};

export default extractTransactionDetails;

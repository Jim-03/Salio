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
  balance: number;
}

// Date and time
const DATE_TIME_REGEX =
  /on (\d{1,2}\/\d{1,2}\/\d{2,4})\s*at (\d{1,2}:\d{1,2}\s*[AP]M)/;

// Merchant names
const MERCHANT_REGEX_1 =
  /(?:from|sent to|paid to|bought Ksh[\d,]+\.\d{1,2} of) (.*?) on \d{1,2}\/\d{1,2}\/\d{1,2} at/;
const MERCHANT_REGEX_2 = /confirmed\. (.*?) of transaction/;
const MERCHANT_REGEX_3 = /[AP]MWithdraw Ksh[\d,]+\.\d{1,2} from (.*?) New/;

// Amount
const AMOUNT_REGEX_1 =
  /[cC]onfirmed\.\s*(?:You have received\s|You bought\s)?Ksh([\d,]+\.\d{1,2})/;
const AMOUNT_REGEX_2 = /[AP]MWithdraw\s+Ksh([\d,]+\.\d{1,2})/;

// Transaction cost
const TX_COST_REGEX = /Transaction cost, Ksh([\d,]+\.\d{1,2})\./;

// Balance
const BALANCE_REGEX = /balance is\sKsh([\d,]+\.\d{1,2})/;

// Boolean checkers
const IS_PAYBILL_REGEX =
  /Ksh[\d,]+\.\d{1,2} sent to .* for .* on \d{1,2}\/\d{1,2}\/\d{2,4}/;
const IS_BUY_GOODS_REGEX =
  /Ksh[\d,]+\.\d{1,2} paid to .* on \d{1,2}\/\d{1,2}\/\d{2,4}/;
const IS_SEND_MONEY_REGEX = /(?:from|sent to) .* [\d{8,10}]+\s+/;
const IS_REVERSAL_REGEX = /confirmed\. Reversal of/;
const IS_WITHDRAW_REGEX = /[AP]MWithdraw/;
const IS_INCOMING_REGEX =
  /sent to|paid to|debited from|[AP]MWithdraw|You bought/;

/**
 * Extract the key details of a transaction in JSON-format
 * @param {string} message Message body
 * @returns {TransactionDetails} A Transaction in JSON format
 */
const extractTransactionDetails = (message: string): TransactionDetails => {
  const dateTimeMatch = message.match(DATE_TIME_REGEX);
  const date = dateTimeMatch ? dateTimeMatch[1] : "";
  const time = dateTimeMatch ? dateTimeMatch[2] : "";
  let merchant = "";
  const m1 = message.match(MERCHANT_REGEX_1);
  if (m1) merchant = m1[1];
  else {
    const m2 = message.match(MERCHANT_REGEX_2);
    if (m2) merchant = m2[1];
    else {
      const m3 = message.match(MERCHANT_REGEX_3);
      if (m3) merchant = m3[1];
    }
  }

  const merchantNames = merchant.split(/\s+/);
  merchant = merchantNames.join(" ");

  let amount = 0.0;
  const a1 = message.match(AMOUNT_REGEX_1);
  if (a1) amount = parseFloat(a1[1].replace(/,/g, ""));
  else {
    const a2 = message.match(AMOUNT_REGEX_2);
    if (a2) amount = parseFloat(a2[1].replace(/,/g, ""));
  }
  const txCostMatch = message.match(TX_COST_REGEX);
  const transactionCost = txCostMatch
    ? parseFloat(txCostMatch[1].replace(/,/g, ""))
    : 0.0;
  const isPayBill = IS_PAYBILL_REGEX.test(message);
  const isBuyGoods = IS_BUY_GOODS_REGEX.test(message);
  const isSendMoney = IS_SEND_MONEY_REGEX.test(message);
  const isReversal = IS_REVERSAL_REGEX.test(message);
  const isWithdraw = IS_WITHDRAW_REGEX.test(message);
  let balance = 0.0;
  const balanceReg = message.match(BALANCE_REGEX);
  if (balanceReg) {
    balance = parseFloat(balanceReg[1].replace(/,/g, ""));
  }

  return {
    merchant,
    date,
    time,
    amount,
    isPayBill: isPayBill ? 1 : 0,
    isBuyGoods: !isPayBill && isBuyGoods ? 1 : 0,
    isSendMoney: !isPayBill && !isBuyGoods && isSendMoney ? 1 : 0,
    isReversal: !isPayBill && !isBuyGoods && !isSendMoney && isReversal ? 1 : 0,
    isWithdraw:
      !isPayBill && !isBuyGoods && !isSendMoney && !isReversal && isWithdraw
        ? 1
        : 0,
    transactionCost,
    incoming: IS_INCOMING_REGEX.test(message) ? 0 : 1,
    balance,
  };
};

export default extractTransactionDetails;

import { AsyncStorage } from 'expo-sqlite/kv-store';

export interface message {
  merchant: string | null,
  date: string | null,
  time: string | null,
  amount: number,
  isPayBill: number,
  isBuyGoods: number,
  isSendMoney: number,
  isReversal: number,
  isWithdraw: number,
  transactionCost: number,
  incoming: number
}

export default class Classifier {
  private weights: Record<string, number[]> = {};
  private categories: string[] = [];
  private numFeatures = 24;
  private learningRate: number = 0.01;

  /**
   * Fetches the required categories and weight data for the classifier
   * @returns {Promise<void>} A promise that resolves when the data is fetched
   */
  public  init = async (): Promise<void> => {
    try {
      const storedCats = await AsyncStorage.getItem('categories');
      if (storedCats) {
        this.categories = JSON.parse(storedCats);
      } else {
        this.categories = ['TRANSPORT', 'AIRTIME & BUNDLES', 'BILLS', 'FOOD', 'SHOPPING', 'FRIENDS & FAMILY', 'INCOME'];
        await AsyncStorage.setItem('categories', JSON.stringify(this.categories));
      }

      const storedWeights = await AsyncStorage.getItem('weights');
      if (storedWeights) {
        this.weights = JSON.parse(storedWeights);
      } else {
        const weights: Record<string, number[]> = {};

        const numCategories = this.categories.length;

        for (let i = 0; i < numCategories; i++) {
          const categoryWeights = [];
          for (let j = 0; j < this.numFeatures; j++) {
            categoryWeights.push((Math.random() * 0.02) - 0.01);
          }
          weights[`${this.categories[i]}`] = categoryWeights;
        }
        this.weights = weights;
        await AsyncStorage.setItem('weights', JSON.stringify(this.weights));
      }
      console.log('Classifier Initialized');
    } catch (error) {
      console.error('Failed to init classifier', error);
    }
  };

  /**
   * Predicts the category of an incoming message
   * @param {string} message The transaction message
   * @returns {string} The transaction's category. UNKNOWN in case it's an invalid transaction message or the prediction is less accurate
   */
  public predict = (message: string): string => {
    // Extract details
    const details = this.extractFeatures(message);
    if (!details.merchant || !details.amount || !details.date || !details.time) {
      return 'UNKNOWN';
    }
    // Normalize
    const features = this.normalize(details);
    // Score
    const logits = this.getLogits(features);
    // Softmax
    const scores = this.softmax(logits);

    const categories = Object.keys(scores);
    const probabilities = Object.values(scores);
    const highestProbability = Math.max(...probabilities);

    return "AI_" + categories[probabilities.indexOf(highestProbability)];
  };

  /**
   * Corrects the model's prediction
   * @param {string} message The transaction message
   * @param {string} actualCategory The name of the category the message belongs to
   */
  public train = (message: string, actualCategory: string) => {
    // Get the actual prediction
    const details = this.extractFeatures(message);
    const features = this.normalize(details);
    const scores = this.softmax(this.getLogits(features));

    const categories = Object.keys(scores);
    const probabilities = Object.values(scores);
    // Set the right prediction
    const target: number[] = new Array(categories.length).fill(0);
    target[categories.indexOf(actualCategory)] = 1;
    // Reduce error
    for (let i = 0; i < Object.keys(this.weights).length; i++) {
      const error = probabilities[i] - target[i];
      const weights = Object.keys(this.weights)[i];

      for (let j = 0; j < this.weights[weights].length; j++) {
        const gradient = error * features[j];
        this.weights[weights][j] -= this.learningRate * gradient;
      }
    }
    // Store weights
    AsyncStorage.setItem('weights', JSON.stringify(this.weights)).then(r => console.log('Memory updated')).catch(console.error);
  };

  /**
   * Extracts all possible features from a message to an object
   * @param {string} message M-Pesa message
   * @returns {message} A message object
   */
  public extractFeatures = (message: string): message => {
    const merchantMatch = message.match(/.*?\s(?:from|sent to|paid to|bought Ksh[\d,]+\.\d{1,2} of) (.*) on \d{1,2}\/\d{1,2}\/\d{1,2} at/) || message.match(/ confirmed\. (.*) of transaction/) || message.match(/[AP]MWithdraw Ksh[\d,]+\.\d{1,2} from (.*) New/);
    const dateMatch = message.match(/on (\d{1,2}\/\d{1,2}\/\d{1,2})\s*at \d{1,2}:\d{1,2} [AP]M/);
    const timeMatch = message.match(/on \d{1,2}\/\d{1,2}\/\d{1,2}\s*at (\d{1,2}:\d{1,2} [AP]M)/);
    const amountMatch = message.match(/.*[cC]onfirmed\.\s*(?:You have received\s|You bought\s)?Ksh([\d,]+\.\d{1,2}) (?:paid to|sent to)?/) || message.match(/[AP]MWithdraw\s+Ksh([\d,]+\.\d{1,2})/);
    const payBillMatch = message.match(/.*Ksh[\d,]+\.\d{1,2} sent to .* for .* on \d{1,2}\/\d{1,2}\/\d{2,4}/);
    const buyGoodsMatch = message.match(/.*Ksh[\d,]+\.\d{1,2} paid to .* on \d{1,2}\/\d{1,2}\/\d{2,4}/);
    const sendMoneyMatch = message.match(/(?:from|sent to) .* [\d{8, 10}]+\s+/);
    const reversalMatch = message.match(/ confirmed. Reversal of/);
    const withdrawMatch = message.match(/[AP]MWithdraw/);
    const transactionCostMatch = message.match(/ Ksh[\d,]+\.\d{1,2}\. Transaction cost, Ksh([\d,]+\.\d{1,2})\. /);
    const directionMatch = message.match(/sent to|paid to|debited from|[AP]MWithdraw|You bought/);

    return {
      merchant: merchantMatch ? merchantMatch[1] : null,
      date: dateMatch ? dateMatch[1] : null,
      time: timeMatch ? timeMatch[1] : null,
      amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0.0,
      isPayBill: payBillMatch ? 1 : 0,
      isBuyGoods: !payBillMatch && buyGoodsMatch ? 1 : 0,
      isSendMoney: !payBillMatch && !buyGoodsMatch && sendMoneyMatch ? 1 : 0,
      isReversal: !payBillMatch && !buyGoodsMatch && !sendMoneyMatch && reversalMatch ? 1 : 0,
      isWithdraw: !payBillMatch && !buyGoodsMatch && !sendMoneyMatch && !reversalMatch && withdrawMatch ? 1 : 0,
      transactionCost: transactionCostMatch ? parseFloat(transactionCostMatch[1].replace(',', '')) : 0.0,
      incoming: directionMatch ? 0 : 1
    };
  };

  /**
   * Converts the human-readable data to numbers used in machine learning
   * @param {message} feature An object containing the transaction features
   * @returns {number[]} A vector from the characteristics of the transaction's features
   */
  private normalize = (feature: message): number[] => {
    const norm_amount = Math.log(feature.amount + 1) / 6;
    const norm_transaction = Math.log(feature.transactionCost + 1) / 6;
    let [time_early_morning, time_late_morning, time_noon, time_evening, time_late_evening, time_early_night, time_late_night, time_dawn] = [0, 0, 0, 0, 0, 0, 0, 0];
    const hour = this.getHour(String(feature.time));
    if (hour < 3) time_late_night = 1;
    else if (hour < 6) time_dawn = 1;
    else if (hour < 9) time_early_morning = 1;
    else if (hour < 12) time_late_morning = 1;
    else if (hour < 15) time_noon = 1;
    else if (hour < 18) time_evening = 1;
    else if (hour < 21) time_late_evening = 1;
    else time_early_night = 1;
    let [sunday, monday, tuesday, wednesday, thursday, friday, saturday] = [0, 0, 0, 0, 0, 0, 0];
    const day = this.parseDate(String(feature.date));
    if (day === 0) sunday = 1;
    else if (day === 1) monday = 1;
    else if (day === 2) tuesday = 1;
    else if (day === 3) wednesday = 1;
    else if (day === 4) thursday = 1;
    else if (day === 5) friday = 1;
    else if (day === 6) saturday = 1;

    return [1, feature.isPayBill, feature.isBuyGoods, feature.isSendMoney, feature.isReversal, feature.isWithdraw, feature.incoming, norm_amount, norm_transaction, time_early_morning, time_late_morning, time_noon, time_evening, time_late_evening, time_early_night, time_late_night, time_dawn, sunday, monday, tuesday, wednesday, thursday, friday, saturday];
  };

  /**
   * Retrieves the hour in 24-hour clock format
   * @param {string} timeStr Time in 12-hour clock format
   * @returns {number} Hour
   */
  private getHour = (timeStr: string): number => {
    let [time, modifier] = timeStr.split(' ');
    let hours = parseInt(time.split(':')[0]);

    if (hours === 12 && modifier === 'AM') hours = 0;
    if (hours !== 12 && modifier === 'PM') hours += 12;

    return hours;
  };

  /**
   * Retrieves the day of the week in a date string
   * @param {string} dateStr A date string in the format dd/mm/yy
   * @returns {number} The day of the week starting from 0-Sunday to 6-Saturday
   */
  private parseDate = (dateStr: string): number => {
    let day = parseInt(dateStr.split('/')[0]);
    let month = parseInt(dateStr.split('/')[1]);
    let year = parseInt(dateStr.split('/')[2]);

    return new Date(Number(`20${year}`), month - 1, day).getDay();
  };

  /**
   * Performs the matrix multiplication for the dot product
   * @param {number[]} features Normalized features
   * @returns {Record<string, number>} An object containing each category and its raw scores
   */
  private getLogits = (features: number[]): Record<string, number> => {
    const logits: Record<string, number> = {};
    for (let i = 0; i < Object.keys(this.weights).length; i++) {
      let score = 0;
      const categoryName = Object.keys(this.weights)[i];
      const categoryWeights = this.weights[categoryName];

      for (let j = 0; j < this.numFeatures; j++) {
        score += features[j] * categoryWeights[j];
      }
      logits[categoryName] = score;
    }
    return logits;
  };

  /**
   * Calculate the probabilities of each category given the logits
   * @param {Record<string, number>} logits A key value pair containing the category name and the raw score
   * @returns {Record<string, number>} An object containing the categories and their probabilities
   */
  private softmax = (logits: Record<string, number>): Record<string, number> => {
    const categories = Object.keys(logits);
    const scores = Object.values(logits);
    const maxLogit = Math.max(...scores);
    const exps = scores.map(l => Math.exp(l - maxLogit));
    let sum = 0;
    exps.forEach(exp => {
      sum += exp;
    });
    const nomExp = exps.map(e => e / sum);
    const probabilities: Record<string, number> = {};
    categories.forEach((c, i) => {
      probabilities[c] = nomExp[i];
    });
    return probabilities;
  };
}
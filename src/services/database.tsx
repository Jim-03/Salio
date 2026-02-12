import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { Loading } from './animation';
import { Modal, Text, View } from 'react-native';
import useAppStyles from '../utils/styles';


const DatabaseContext = createContext<SQLite.SQLiteDatabase|null>(null);

/**
 * Initializes a connection to the app's database
 * @param {React.ReactNode} children Child elements depending on the db connection
 * @returns {React.ReactNode} A reusable component that depends on the db connection or a loading screen
 */
export const DatabaseProvider = ({children}: {children: React.ReactNode}): React.ReactNode => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [db, setDb] = useState<SQLite.SQLiteDatabase|null>(null);
  const styles = useAppStyles()

  useEffect(() => {
    const createDatabase = async () => {
      try {
        console.log('Creating database...');
        const db = await SQLite.openDatabaseAsync('salio');
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS transactions
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                merchant TEXT NOT NULL,
                transaction_type TEXT NOT NULL,
                transaction_date TEXT NOT NULL,
                transaction_time TEXT NOT NULL,
                amount REAL NOT NULL,
                transaction_cost REAL NOT NULL,
                direction TEXT NOT NULL
            );
        `);
        setDb(db);
        setIsInitialized(true);
        console.log('Database successfully created...');
      } catch (e) {
        console.error('An error has occurred while creating the database: ', e);
      }
    };
    createDatabase();
  }, []);

  if (!isInitialized) {
    return <Modal>
      <View style={styles.screenBackground}>
        <Text style={styles.logo}>Salio</Text>
        <Loading color={'#2E8B57FF'}/>
      </View>
    </Modal>;
  }

  return <DatabaseContext.Provider value={db}>
    {children}
  </DatabaseContext.Provider>
};

export const useDB = () => {
  const db = useContext(DatabaseContext);
  if (!db) throw new Error('useDB must be used within a DatabaseProvider');
  return db;
};
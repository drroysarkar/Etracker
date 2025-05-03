import * as SQLite from 'expo-sqlite';
import uuid from 'react-native-uuid';

const db = SQLite.openDatabaseSync('expenseTracker.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      title TEXT,
      category TEXT,
      note TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS category_limits (
      id TEXT PRIMARY KEY NOT NULL,
      category_name TEXT NOT NULL,
      limit_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL DEFAULT 0,
      last_used_date TEXT
    );
    CREATE TABLE IF NOT EXISTS split_bills (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      members INTEGER NOT NULL,
      per_person_amount REAL NOT NULL
    );

     CREATE TABLE IF NOT EXISTS user_categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'ellipsis-horizontal'
    );
    

    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY NOT NULL,
      contact_name TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      amount REAL NOT NULL,
      title TEXT NOT NULL,
      note TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL
    );


  `);
};

export const addTransaction = (
  type: string,
  amount: number,
  title: string,
  category: string,
  note: string,
  date: string,
  time: string,
  callback: (success: boolean) => void
) => {
  const id = uuid.v4() as string;
  try {
    db.runSync(
      `INSERT INTO transactions (id, type, amount, title, category, note, date, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, type, amount, title, category, note, date, time]
    );
    // Update category_limits remaining_amount and last_used_date
    db.runSync(
      `UPDATE category_limits 
       SET remaining_amount = remaining_amount - ?,
           last_used_date = ?
       WHERE category_name = ?`,
      [amount, date, category]
    );
    callback(true);
  } catch (error) {
    console.error('Error adding transaction:', error);
    callback(false);
  }
};

export const getTransactions = (
  callback: (transactions: any[]) => void
) => {
  try {
    const results = db.getAllSync<{
      id: string;
      type: string;
      amount: number;
      title?: string;
      category?: string;
      note?: string;
      date: string;
      time: string;
    }>(`SELECT * FROM transactions ORDER BY date DESC, time DESC`);
    callback(results);
  } catch (error) {
    console.error('Error getting transactions:', error);
    callback([]);
  }
};

export const setCategoryLimit = (
  categoryName: string,
  limit: number,
  callback: (success: boolean) => void
) => {
  try {
    const existing = db.getFirstSync(
      `SELECT id FROM category_limits WHERE category_name = ?`,
      [categoryName]
    );
    
    if (existing) {
      db.runSync(
        `UPDATE category_limits 
         SET limit_amount = ?, 
             remaining_amount = ? 
         WHERE category_name = ?`,
        [limit, limit, categoryName]
      );
    } else {
      const id = uuid.v4() as string;
      db.runSync(
        `INSERT INTO category_limits (id, category_name, limit_amount, remaining_amount) 
         VALUES (?, ?, ?, ?)`,
        [id, categoryName, limit, limit]
      );
    }
    callback(true);
  } catch (error) {
    console.error('Error setting category limit:', error);
    callback(false);
  }
};

export const deleteCategoryLimit = (
  categoryName: string,
  callback: (success: boolean) => void
) => {
  try {
    db.runSync(
      `UPDATE category_limits 
       SET limit_amount = 0, 
           remaining_amount = 0,
           last_used_date = NULL 
       WHERE category_name = ?`,
      [categoryName]
    );
    callback(true);
  } catch (error) {
    console.error('Error deleting category limit:', error);
    callback(false);
  }
};

export const getCategoryLimits = (
  callback: (limits: any[]) => void
) => {
  try {
    const results = db.getAllSync<{
      id: string;
      category_name: string;
      limit_amount: number;
      remaining_amount: number;
      last_used_date?: string;
    }>(`SELECT * FROM category_limits`);
    callback(results);
  } catch (error) {
    console.error('Error getting category limits:', error);
    callback([]);
  }
};


export const addUserCategory = (
  name: string,
  icon: string,
  callback: (success: boolean) => void
) => {
  const id = uuid.v4() as string;
  try {
    db.runSync(
      `INSERT INTO user_categories (id, name, icon) VALUES (?, ?, ?)`,
      [id, name, icon || 'ellipsis-horizontal']
    );
    callback(true);
  } catch (error) {
    console.error('Error adding user category:', error);
    callback(false);
  }
};

export const getUserCategories = (
  callback: (categories: {id: string, name: string, icon: string}[]) => void
) => {
  try {
    const results = db.getAllSync<{
      id: string;
      name: string;
      icon: string;
    }>(`SELECT * FROM user_categories ORDER BY name ASC`);
    callback(results);
  } catch (error) {
    console.error('Error getting user categories:', error);
    callback([]);
  }
};

export const addSplitBill = (
  title: string,
  category: string,
  amount: number,
  note: string,
  date: string,
  time: string,
  month: number,
  year: number,
  members: number,
  perPersonAmount: number,
  callback: (success: boolean) => void
) => {
  const id = uuid.v4() as string;
  try {
    db.runSync(
      `INSERT INTO split_bills (id, title, category, amount, note, date, time, month, year, members, per_person_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, category, amount, note, date, time, month, year, members, perPersonAmount]
    );
    callback(true);
  } catch (error) {
    console.error('Error adding split bill:', error);
    callback(false);
  }
};

export const getSplitBillsByCategory = (
  category: string,
  callback: (bills: any[]) => void
) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const results = db.getAllSync<{
      id: string;
      title: string;
      amount: number;
      note?: string;
      date: string;
      time: string;
      members: number;
      per_person_amount: number;
    }>(`
      SELECT * FROM split_bills 
      WHERE category = ? AND month = ? AND year = ?
      ORDER BY date DESC, time DESC
    `, [category, currentMonth, currentYear]);
    
    callback(results);
  } catch (error) {
    console.error('Error getting split bills:', error);
    callback([]);
  }
};

export const getSplitBillsAllMonths = (
  category: string = '',
  callback: (bills: {month: number, year: number, data: any[]}[]) => void
) => {
  try {
    let query = `SELECT * FROM split_bills`;
    const params = [];
    
    if (category) {
      query += ` WHERE category = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY year DESC, month DESC, date DESC, time DESC`;
    
    const results = db.getAllSync<{
      id: string;
      title: string;
      amount: number;
      note?: string;
      date: string;
      time: string;
      members: number;
      per_person_amount: number;
      month: number;
      year: number;
    }>(query, params);
    
    // Group by month and year
    const grouped = results.reduce((acc, bill) => {
      const key = `${bill.year}-${bill.month}`;
      if (!acc[key]) {
        acc[key] = {
          month: bill.month,
          year: bill.year,
          data: []
        };
      }
      acc[key].data.push(bill);
      return acc;
    }, {} as Record<string, {month: number, year: number, data: any[]}>);
    
    callback(Object.values(grouped));
  } catch (error) {
    console.error('Error getting split bills:', error);
    callback([]);
  }
};


export const updateSplitBill = (
  id: string,
  title: string,
  category: string,
  amount: number,
  note: string,
  date: string,
  time: string,
  month: number,
  year: number,
  members: number,
  perPersonAmount: number,
  callback: (success: boolean) => void
) => {
  try {
    db.runSync(
      `UPDATE split_bills 
       SET title = ?, 
           category = ?,
           amount = ?,
           note = ?,
           date = ?,
           time = ?,
           month = ?,
           year = ?,
           members = ?,
           per_person_amount = ?
       WHERE id = ?`,
      [title, category, amount, note, date, time, month, year, members, perPersonAmount, id]
    );
    callback(true);
  } catch (error) {
    console.error('Error updating split bill:', error);
    callback(false);
  }
};

export const deleteSplitBill = (
  id: string,
  callback: (success: boolean) => void
) => {
  try {
    db.runSync(
      `DELETE FROM split_bills WHERE id = ?`,
      [id]
    );
    callback(true);
  } catch (error) {
    console.error('Error deleting split bill:', error);
    callback(false);
  }
};



export const deleteUserCategory = (
  categoryName: string,
  callback: (success: boolean) => void
) => {
  try {
    db.runSync(
      `DELETE FROM user_categories WHERE name = ?`,
      [categoryName]
    );
    callback(true);
  } catch (error) {
    console.error('Error deleting user category:', error);
    callback(false);
  }
};




export const addLoan = (
  contactName: string,
  contactNumber: string,
  amount: number,
  title: string,
  note: string,
  date: string,
  time: string,
  month: number,
  year: number,
  callback: (success: boolean) => void
) => {
  const id = uuid.v4() as string;
  try {
    db.runSync(
      `INSERT INTO loans (id, contact_name, contact_number, amount, title, note, date, time, month, year) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, contactName, contactNumber, amount, title, note, date, time, month, year]
    );
    callback(true);
  } catch (error) {
    console.error('Error adding loan:', error);
    callback(false);
  }
};

export const getLoans = (
  callback: (loans: any[]) => void
) => {
  try {
    const results = db.getAllSync<{
      id: string;
      contact_name: string;
      contact_number: string;
      amount: number;
      title: string;
      note?: string;
      date: string;
      time: string;
      month: number;
      year: number;
    }>(`SELECT * FROM loans ORDER BY date DESC, time DESC`);
    callback(results);
  } catch (error) {
    console.error('Error getting loans:', error);
    callback([]);
  }
};

export const updateLoan = (
  id: string,
  contactName: string,
  contactNumber: string,
  amount: number,
  title: string,
  note: string,
  date: string,
  time: string,
  month: number,
  year: number,
  callback: (success: boolean) => void
) => {
  try {
    db.runSync(
      `UPDATE loans 
       SET contact_name = ?, contact_number = ?, amount = ?, title = ?, note = ?, date = ?, time = ?, month = ?, year = ?
       WHERE id = ?`,
      [contactName, contactNumber, amount, title, note, date, time, month, year, id]
    );
    callback(true);
  } catch (error) {
    console.error('Error updating loan:', error);
    callback(false);
  }
};

export const deleteLoan = (
  id: string,
  callback: (success: boolean) => void
) => {
  try {
    db.runSync(`DELETE FROM loans WHERE id = ?`, [id]);
    callback(true);
  } catch (error) {
    console.error('Error deleting loan:', error);
    callback(false);
  }
};

export const getLoansByContact = (
  contactName: string,
  callback: (loans: {month: number, year: number, data: any[]}[]) => void
) => {
  try {
    const results = db.getAllSync<{
      id: string;
      contact_name: string;
      contact_number: string;
      amount: number;
      title: string;
      note?: string;
      date: string;
      time: string;
      month: number;
      year: number;
    }>(`SELECT * FROM loans WHERE contact_name = ? ORDER BY year DESC, month DESC, date DESC, time DESC`, [contactName]);
    
    const grouped = results.reduce((acc, loan) => {
      const key = `${loan.year}-${loan.month}`;
      if (!acc[key]) {
        acc[key] = {
          month: loan.month,
          year: loan.year,
          data: []
        };
      }
      acc[key].data.push(loan);
      return acc;
    }, {} as Record<string, {month: number, year: number, data: any[]}>);
    
    callback(Object.values(grouped));
  } catch (error) {
    console.error('Error getting loans by contact:', error);
    callback([]);
  }
};
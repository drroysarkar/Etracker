import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, getCategoryLimits, setCategoryLimit, deleteCategoryLimit } from '../../services/database';

interface Category {
  id: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  lastUsedDate?: string;
  icon: string;
  iconBackgroundColor: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  date: string;
}

export default function BudgetScreen() {
  const currentDate = new Date('2025-05-03');
  const [displayedMonth, setDisplayedMonth] = useState(currentDate);
  const minMonth = new Date(currentDate);
  minMonth.setMonth(currentDate.getMonth() - 6);

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(displayedMonth);
    newDate.setMonth(displayedMonth.getMonth() - 1);
    if (newDate >= minMonth) {
      setDisplayedMonth(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(displayedMonth);
    newDate.setMonth(displayedMonth.getMonth() + 1);
    if (newDate <= currentDate) {
      setDisplayedMonth(newDate);
    }
  };

  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Transportation', limit: 0, spent: 0, remaining: 0, icon: '🚗', iconBackgroundColor: '#D6EFFF' },
    { id: '2', name: 'Bills and Utilities', limit: 0, spent: 0, remaining: 0, icon: '📜', iconBackgroundColor: '#FFF2CC' },
    { id: '3', name: 'Food and Drinks', limit: 0, spent: 0, remaining: 0, icon: '🍔', iconBackgroundColor: '#D6EFFF' },
    { id: '4', name: 'Entertainment', limit: 0, spent: 0, remaining: 0, icon: '🎮', iconBackgroundColor: '#FFF2CC' },
    { id: '5', name: 'Others', limit: 0, spent: 0, remaining: 0, icon: '🔲', iconBackgroundColor: '#E0E0E0' },
    { id: '6', name: 'Investments', limit: 0, spent: 0, remaining: 0, icon: '📈', iconBackgroundColor: '#C8E6C9' },
    { id: '7', name: 'Shopping', limit: 0, spent: 0, remaining: 0, icon: '🛒', iconBackgroundColor: '#E6E0FA' },
    { id: '8', name: 'Home', limit: 0, spent: 0, remaining: 0, icon: '🏠', iconBackgroundColor: '#D3F3D3' },
    { id: '9', name: 'Healthcare', limit: 0, spent: 0, remaining: 0, icon: '🏥', iconBackgroundColor: '#FFE6E6' },
    { id: '10', name: 'Education', limit: 0, spent: 0, remaining: 0, icon: '🎓', iconBackgroundColor: '#E6F0FA' },
    { id: '11', name: 'Travel', limit: 0, spent: 0, remaining: 0, icon: '✈️', iconBackgroundColor: '#E0F7FA' },
    { id: '12', name: 'Personal Care', limit: 0, spent: 0, remaining: 0, icon: '💇', iconBackgroundColor: '#F3E5F5' },
    { id: '13', name: 'Gifts and Donations', limit: 0, spent: 0, remaining: 0, icon: '🎁', iconBackgroundColor: '#FFEBEE' },
    { id: '14', name: 'Insurance', limit: 0, spent: 0, remaining: 0, icon: '🛡️', iconBackgroundColor: '#E8F5E9' },
    { id: '15', name: 'Debt Payments', limit: 0, spent: 0, remaining: 0, icon: '💳', iconBackgroundColor: '#FFF3E0' },
    { id: '16', name: 'Savings', limit: 0, spent: 0, remaining: 0, icon: '💰', iconBackgroundColor: '#E0F7FA' },
    { id: '17', name: 'Medical', limit: 0, spent: 0, remaining: 0, icon: '🩺', iconBackgroundColor: '#E6E0FA' },
    { id: '18', name: 'Taxes', limit: 0, spent: 0, remaining: 0, icon: '🏛️', iconBackgroundColor: '#FFE6E6' },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [categoryTransactions, setCategoryTransactions] = useState<Transaction[]>([]);
  const [previousProgress, setPreviousProgress] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      getTransactions((loadedTransactions) => {
        setTransactions(loadedTransactions);
        getCategoryLimits((limits) => {
          const updatedCategories = categories.map(category => {
            const categoryTransactions = loadedTransactions.filter(
              t => t.type === 'expense' && t.category === category.name
            );
            const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
            const limitData = limits.find(l => l.category_name === category.name);
            const limit = limitData?.limit_amount || 0;
            const remaining = limit - spent;
            return { 
              ...category, 
              spent,
              limit,
              remaining: remaining < 0 ? remaining : Math.max(0, remaining),
              lastUsedDate: limitData?.last_used_date
            };
          });
          setCategories(updatedCategories);

          const totalBudget = updatedCategories.reduce((sum, cat) => sum + cat.limit, 0);
          const totalSpent = updatedCategories.reduce((sum, cat) => sum + cat.spent, 0);
          const currentProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
          setPreviousProgress(currentProgress > 0 ? currentProgress - 10 : 0);
        });
      });
    }, [])
  );

  const totalBudget = categories.reduce((sum, cat) => sum + cat.limit, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const progressPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleSetLimit = (category: Category) => {
    setSelectedCategory(category);
    setNewLimit(category.limit.toString());
    setLimitModalVisible(true);
  };

  const handleViewTransactions = () => {
    if (selectedCategory) {
      const filteredTransactions = transactions.filter(
        t => t.category === selectedCategory.name && t.type === 'expense'
      );
      setCategoryTransactions(filteredTransactions);
      setTransactionModalVisible(true);
    }
  };

  const saveLimit = () => {
    if (selectedCategory && newLimit) {
      setCategoryLimit(selectedCategory.name, parseFloat(newLimit), (success) => {
        if (success) {
          const updatedCategories = categories.map(cat =>
            cat.id === selectedCategory.id ? { 
              ...cat, 
              limit: parseFloat(newLimit),
              remaining: parseFloat(newLimit) - cat.spent 
            } : cat
          );
          setCategories(updatedCategories);
          setLimitModalVisible(false);
        }
      });
    }
  };

  const deleteLimit = () => {
    if (selectedCategory) {
      deleteCategoryLimit(selectedCategory.name, (success) => {
        if (success) {
          const updatedCategories = categories.map(cat =>
            cat.id === selectedCategory.id ? { 
              ...cat, 
              limit: 0,
              remaining: 0,
              lastUsedDate: undefined 
            } : cat
          );
          setCategories(updatedCategories);
          setLimitModalVisible(false);
        }
      });
    }
  };

  const getProgressPercentage = (spent: number, limit: number) => {
    if (limit <= 0) return 0;
    const percentage = (spent / limit) * 100;
    return Math.min(percentage, 100);
  };

  const renderCategory = (category: Category) => {
    const isBudgeted = category.limit > 0;
    const percentageUsed = getProgressPercentage(category.spent, category.limit);
    const isExceeded = category.spent > category.limit;
    return (
      <View key={category.id}>
        <TouchableOpacity
          style={styles.categoryContainer}
          onPress={() => handleCategoryPress(category)}
        >
          <View style={[styles.iconContainer, { backgroundColor: category.iconBackgroundColor }]}>
            <Text style={styles.icon}>{category.icon}</Text>
          </View>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <View style={styles.remainingContainer}>
              <Text style={styles.remainingLabel}>
                {isBudgeted ? 'Remaining: ' : 'Spent: '}
              </Text>
              <Text style={[
                styles.remainingAmount,
                isExceeded && styles.exceededText,
                !isExceeded && isBudgeted && styles.normalAmount
              ]}>
                {isBudgeted ? category.remaining : category.spent}
              </Text>
            </View>
          </View>
          {isBudgeted && (
            <View style={styles.roundedProgressWrapper}>
              <View style={styles.roundedProgressContainer}>
                <View
                  style={[
                    styles.roundedProgressFill,
                    {
                      width: `${percentageUsed}%`,
                      backgroundColor: isExceeded ? '#FF0000' : '#FFA500', // Updated to match the blue color in the image
                    },
                  ]}
                />
                <Text style={[styles.percentUsedText, isExceeded && styles.exceededText]}>
                  {isExceeded ? 'EXCEEDED' : `${Math.round(percentageUsed)}% USED`}
                </Text>
              </View>
            </View>
          )}
          {!isBudgeted && (
            <TouchableOpacity
              style={styles.setLimitButton}
              onPress={() => handleSetLimit(category)}
            >
              <Text style={styles.setLimitText}>SET LIMIT</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        {selectedCategory?.id === category.id && isBudgeted && (
          <View style={styles.optionsContainer}>
            <View style={styles.limitSpentRemainingContainer}>
              <View style={styles.limitContainer}>
                <Text style={styles.limitLabel}>Limit</Text>
                <Text style={styles.limitAmount}>{category.limit}</Text>
                <TouchableOpacity onPress={() => handleSetLimit(category)} style={styles.editIconContainer}>
                  <Text style={styles.editIcon}>✎</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.spentContainer}>
                <Text style={styles.spentLabel}>Spent</Text>
                <Text style={styles.spentAmount}>{category.spent}</Text>
              </View>
              <View style={styles.remainingDetailsContainer}>
                <Text style={styles.remainingDetailsLabel}>Remaining</Text>
                <Text style={[styles.remainingDetailsAmount, isExceeded && styles.exceededText]}>
                  {category.remaining}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleViewTransactions}>
              <Text style={styles.optionText}>View Transactions</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderTransaction = (transaction: Transaction) => (
    <View key={transaction.id} style={styles.transactionContainer}>
      <Text style={styles.transactionAmount}>-{transaction.amount}</Text>
      <Text style={styles.transactionDate}>{transaction.date}</Text>
      <Text style={styles.transactionOverall}>Overall: -{transaction.amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handlePreviousMonth} disabled={displayedMonth <= minMonth}>
            <Text style={[styles.arrow, displayedMonth <= minMonth && styles.disabledArrow]}>←</Text>
          </TouchableOpacity>
          <Text style={styles.header}>{formatMonthYear(displayedMonth)}</Text>
          <TouchableOpacity onPress={handleNextMonth} disabled={displayedMonth >= currentDate}>
            <Text style={[styles.arrow, displayedMonth >= currentDate && styles.disabledArrow]}>→</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryItem}>TOTAL BUDGET{`\n`}{totalBudget}</Text>
          <Text style={styles.summaryItem}>TOTAL SPENT{`\n`}{totalSpent}</Text>
          <Text style={styles.summaryItem}>REMAINING{`\n`}{totalRemaining}</Text>
        </View>
        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          {progressPercentage > 0 && previousProgress < progressPercentage && (
            <View style={[styles.todayMarker, { left: `${previousProgress}%` }]}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          )}
        </View>
        <Text style={styles.percentUsedTextSmall}>
          {Math.round(progressPercentage)}% used
        </Text>

        <Text style={styles.sectionHeader}>Budgeted Categories</Text>
        {categories.filter(c => c.limit > 0).map(renderCategory)}

        <Text style={styles.sectionHeader}>Not Budgeted Categories</Text>
        {categories.filter(c => c.limit <= 0).map(renderCategory)}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={limitModalVisible}
        onRequestClose={() => setLimitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Budget</Text>
            <Text style={styles.modalCategory}>{selectedCategory?.name}</Text>
            <TextInput
              style={styles.inputBox}
              keyboardType="numeric"
              placeholder="Enter limit"
              value={newLimit}
              onChangeText={setNewLimit}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.buttonRed} onPress={deleteLimit}>
                <Text style={styles.buttonText}>DELETE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonGrey} onPress={() => setLimitModalVisible(false)}>
                <Text style={styles.buttonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonPrimary} onPress={saveLimit}>
                <Text style={styles.buttonText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={transactionModalVisible}
        onRequestClose={() => setTransactionModalVisible(false)}
      >
        <View style={styles.transactionModalContainer}>
          <View style={styles.transactionModalHeader}>
            <TouchableOpacity onPress={() => setTransactionModalVisible(false)}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.transactionModalTitle}>{selectedCategory?.name}</Text>
            <Text style={styles.transactionModalSubtitle}>{formatMonthYear(displayedMonth)}</Text>
          </View>
          {categoryTransactions.map(renderTransaction)}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { padding: 20 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  header: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1, color: '#333', letterSpacing: 1 },
  arrow: { fontSize: 24, color: '#666', paddingHorizontal: 10 },
  disabledArrow: { color: '#ccc' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  summaryItem: { textAlign: 'center', fontSize: 14, color: '#333', fontWeight: '600', lineHeight: 20 },
  progressBarWrapper: { 
    height: 10, 
    backgroundColor: '#E6E6FA', 
    borderRadius: 5, 
    overflow: 'hidden', 
    marginTop: 5, 
    position: 'relative' 
  },
  progressBarFill: { height: '100%', backgroundColor: '#4169E1', borderRadius: 5 },
  todayMarker: { 
    position: 'absolute', 
    top: -20, 
    width: 1, 
    height: 30, 
    backgroundColor: '#28A745' 
  },
  todayText: { fontSize: 12, color: '#28A745', position: 'absolute', top: -20, left: -15, fontWeight: '500' },
  percentUsedTextSmall: { fontSize: 12, color: '#666', marginVertical: 5, textAlign: 'center', fontWeight: '500' },
  sectionHeader: { marginTop: 20, fontWeight: '600', fontSize: 14, color: '#666', letterSpacing: 0.5 },
  categoryContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginVertical: 5,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  iconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  icon: { fontSize: 20 },
  categoryDetails: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#333', letterSpacing: 0.2 },
  remainingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  remainingLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  remainingAmount: { fontSize: 14, fontWeight: 'bold', marginLeft: 5 },
  normalAmount: { color: '#000' },
  exceededText: { color: 'white', fontWeight: 'bold' },
  roundedProgressWrapper: { alignItems: 'flex-end' },
  roundedProgressContainer: { 
    backgroundColor: '#E6E6FA', 
    borderRadius: 20, 
    position: 'relative',
    overflow: 'hidden',
    width: 90,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  roundedProgressFill: { 
    height: '100%', 
    position: 'absolute', 
    left: 0, 
    top: 0,
    borderRadius: 20
  },
  percentUsedText: { 
    fontSize: 12, 
    color: 'black', 
    textAlign: 'center',
    zIndex: 1,
    fontWeight: '600',
    paddingHorizontal: 8
  },
  setLimitButton: { 
    borderWidth: 1, 
    borderColor: '#5E66FF', 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 6, 
    alignSelf: 'flex-end',
    backgroundColor: '#FFF'
  },
  setLimitText: { fontSize: 12, color: '#5E66FF', textAlign: 'center', fontWeight: '600', letterSpacing: 0.5 },
  optionsContainer: { paddingVertical: 8, paddingLeft: 50, backgroundColor: '#FFF', borderRadius: 8 },
  limitSpentRemainingContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingRight: 15 },
  limitContainer: { flexDirection: 'row', alignItems: 'center' },
  limitLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  limitAmount: { fontSize: 14, fontWeight: 'bold', marginLeft: 5, color: '#000' },
  editIconContainer: { marginLeft: 5 },
  editIcon: { fontSize: 16, color: '#666' },
  spentContainer: { flexDirection: 'row', alignItems: 'center' },
  spentLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  spentAmount: { fontSize: 14, fontWeight: 'bold', marginLeft: 5, color: '#000' },
  remainingDetailsContainer: { flexDirection: 'row', alignItems: 'center' },
  remainingDetailsLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  remainingDetailsAmount: { fontSize: 14, fontWeight: 'bold', marginLeft: 5, color: '#000' },
  optionText: { color: '#5E66FF', marginVertical: 4, fontSize: 14, fontWeight: '500' },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalBox: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
  modalCategory: { fontSize: 16, marginBottom: 10, color: '#666', fontWeight: '500' },
  inputBox: { 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 6, 
    padding: 10, 
    marginBottom: 15,
    fontSize: 14,
    color: '#333'
  },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  buttonRed: { backgroundColor: '#F44336', padding: 10, borderRadius: 6 },
  buttonGrey: { backgroundColor: '#999', padding: 10, borderRadius: 6 },
  buttonPrimary: { backgroundColor: '#5E66FF', padding: 10, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  transactionModalContainer: { flex: 1, backgroundColor: '#fff', padding: 20 },
  transactionModalHeader: { alignItems: 'center', marginBottom: 20 },
  backArrow: { fontSize: 24, position: 'absolute', left: 0, color: '#333' },
  transactionModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  transactionModalSubtitle: { fontSize: 14, color: '#666', fontWeight: '500' },
  transactionContainer: { 
    backgroundColor: '#f5f7fa', 
    padding: 10, 
    borderRadius: 8, 
    marginVertical: 5, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  transactionAmount: { fontSize: 16, color: '#F44336', fontWeight: '600' },
  transactionDate: { fontSize: 14, color: '#666', fontWeight: '500' },
  transactionOverall: { fontSize: 14, color: '#666', fontWeight: '500' }
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getTransactions } from '../../services/database';
import { FontAwesome5, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import moment from 'moment';

interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface GroupedTransaction {
  title: string;
  data: Transaction[];
  total: number;
}

const filterOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'All'] as const;
type FilterType = typeof filterOptions[number];

const menuOptions = [
  { name: 'Manage Budget', path: '/budget', icon: 'wallet-outline' },
  { name: 'Split Your Bill', path: '/split-bill', icon: 'people-outline' },
  { name: 'Track Loans', path: '/track-loans', icon: 'cash-outline' },
] as const;

type MenuPath = typeof menuOptions[number]['path'];

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [filter, setFilter] = useState<FilterType>('Monthly');
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransaction[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = () => {
    getTransactions((transactions: Transaction[]) => {
      setTransactions(transactions);
      calculateTotals(transactions);
      filterTransactions(transactions, filter);
    });
  };

  const calculateTotals = (transactions: Transaction[]) => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === 'income') incomeTotal += transaction.amount;
      else expenseTotal += transaction.amount;
    });

    setIncome(incomeTotal);
    setExpense(expenseTotal);
  };

  const filterTransactions = (transactions: Transaction[], filterType: FilterType) => {
    let filtered = [...transactions];

    // Apply date filtering
    const now = moment();
    switch (filterType) {
      case 'Daily':
        filtered = filtered.filter((t) => moment(t.date).isSame(now, 'day'));
        break;
      case 'Weekly':
        filtered = filtered.filter((t) => moment(t.date).isSame(now, 'week'));
        break;
      case 'Monthly':
        filtered = filtered.filter((t) => moment(t.date).isSame(now, 'month'));
        break;
      case 'Yearly':
        filtered = filtered.filter((t) => moment(t.date).isSame(now, 'year'));
        break;
      case 'All':
        // No filtering
        break;
    }

    // Sort by date descending
    filtered.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());

    // Group by appropriate time period
    const groups: { [key: string]: Transaction[] } = {};

    filtered.forEach((transaction) => {
      let groupKey = '';
      const transactionDate = moment(transaction.date);

      switch (filterType) {
        case 'Daily':
          groupKey = transactionDate.format('ddd, MMM D');
          break;
        case 'Weekly':
          groupKey = transactionDate.format('ddd, MMM D');
          break;
        case 'Monthly':
          groupKey = transactionDate.format('ddd, MMM D');
          break;
        case 'Yearly':
          groupKey = transactionDate.format('MMMM YYYY');
          break;
        case 'All':
          groupKey = transactionDate.format('MMMM YYYY');
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(transaction);
    });

    const grouped: GroupedTransaction[] = Object.keys(groups).map((key) => ({
      title: key,
      data: groups[key],
      total: groups[key].reduce((sum, item) => sum + (item.type === 'expense' ? item.amount : 0), 0),
    }));

    setGroupedTransactions(grouped);
  };

  const handleFilterSelect = (selectedFilter: FilterType) => {
    setFilter(selectedFilter);
    setFilterModalVisible(false);
    filterTransactions(transactions, selectedFilter);
  };

  const handleMenuSelect = (path: MenuPath) => {
    setMenuVisible(false);
    router.push(path);
  };

  const renderIcon = (category: string) => {
    const iconProps = { size: 20 };

    switch (category) {
      case 'Entertainment':
        return <FontAwesome5 name="gamepad" {...iconProps} color="#FF7043" />;
      case 'Food and Drinks':
        return <MaterialCommunityIcons name="food" {...iconProps} color="#66BB6A" />;
      case 'Bills and Utilities':
        return <MaterialCommunityIcons name="receipt" {...iconProps} color="#42A5F5" />;
      case 'Transportation':
        return <MaterialCommunityIcons name="bus" {...iconProps} color="#FFA726" />;
      case 'Shopping':
        return <Entypo name="shopping-bag" {...iconProps} color="#AB47BC" />;
      case 'Home':
        return <MaterialCommunityIcons name="home" {...iconProps} color="#7E57C2" />;
      case 'Investments':
        return <MaterialCommunityIcons name="finance" {...iconProps} color="#26A69A" />;
      case 'Others':
        return <Ionicons name="wallet" {...iconProps} color="#78909C" />;
      default:
        return <Ionicons name="wallet" {...iconProps} color="#78909C" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Entertainment':
        return '#FFE0B2';
      case 'Food and Drinks':
        return '#C8E6C9';
      case 'Bills and Utilities':
        return '#BBDEFB';
      case 'Transportation':
        return '#FFE0B2';
      case 'Shopping':
        return '#E1BEE7';
      case 'Home':
        return '#D1C4E9';
      case 'Investments':
        return '#B2DFDB';
      case 'Others':
        return '#ECEFF1';
      default:
        return '#ECEFF1';
    }
  };

  const renderSectionHeader = ({ section }: { section: GroupedTransaction }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.sectionTotalLabel}>Overall:-</Text>
        <Text style={styles.sectionTotalText}> ₹ {section.total.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={[styles.iconBox, { backgroundColor: getCategoryColor(item.category) }]}>
        {renderIcon(item.category)}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
      </View>
      <Text style={styles.transactionAmount}>- {item.amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{moment().format('MMMM YYYY')}</Text>
        <Ionicons name="chevron-forward" size={20} color="#000" />
        <TouchableOpacity
          style={styles.filterContainer}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterText}>{filter}</Text>
          <Ionicons name="chevron-down" size={16} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Income</Text>
          <View style={styles.cardValueRow}>
            <Text style={styles.cardValue}>{income}</Text>
            <Ionicons name="arrow-down" size={16} color="#00C853" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Expense</Text>
          <View style={styles.cardValueRow}>
            <Text style={styles.cardValue}>{expense}</Text>
            <Ionicons name="arrow-up" size={16} color="#FFD600" />
          </View>
        </View>
      </View>

      <SectionList
        sections={groupedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-transaction')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.filterOption}
                onPress={() => handleFilterSelect(option)}
              >
                <Text style={styles.filterOptionText}>{option}</Text>
                {filter === option && <Ionicons name="checkmark" size={20} color="#5E66FF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Hamburger Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderText}>Menu</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMenuVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.name}
                style={styles.menuItem}
                onPress={() => handleMenuSelect(option.path)}
                activeOpacity={0.8}
              >
                <Ionicons name={option.icon} size={24} color="#1A3C6E" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>{option.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F2F4F6',
    borderRadius: 12,
  },
  filterText: {
    fontSize: 14,
    marginRight: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#F1F4F9',
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 6,
  },
  cardValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  sectionHeaderText: {
    fontSize: 14,
    color: 'gray',
  },
  sectionTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'gray',
  },
  sectionTotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCategory: {
    fontSize: 13,
    color: 'gray',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#2962FF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionText: {
    fontSize: 16,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker overlay for contrast
  },
  menuContainer: {
    backgroundColor: '#008B8B',
    width: '75%', // Slightly wider for better content fit
    height: '100%',
    padding: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  menuHeaderText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white', 
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2962FF', // Accent color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row', // Align icon and text in a row
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: '#F8FAFF', // Light background for items
    transform: [{ scale: 1 }], // For press animation
  },
  menuItemIcon: {
    marginRight: 15, // Space between icon and text
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A3C6E', // Consistent dark blue
  },
});
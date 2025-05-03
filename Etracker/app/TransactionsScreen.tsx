import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, NavigationProp, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { getTransactions } from '../services/database';
import moment from 'moment';

type RootStackParamList = {
  BudgetScreen: undefined;
  TransactionsScreen: { categoryName: string; month: string };
};

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  date: string;
}

export default function TransactionsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TransactionsScreen'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { categoryName, month } = route.params || {};

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    getTransactions((loadedTransactions: Transaction[]) => {
      const filteredTransactions = loadedTransactions.filter(
        t =>
          t.category === categoryName &&
          t.type === 'expense' &&
          new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase() === month
      );
      setTransactions(filteredTransactions);
    });
  }, [categoryName, month]);

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);

  const renderIcon = (categoryName: string) => {
    const iconProps = { size: 24 };
    switch (categoryName) {
      case 'Others':
        return <Ionicons name="ellipsis-horizontal" {...iconProps} color="#78909C" />;
      case 'Food and Drinks':
        return <MaterialCommunityIcons name="food" {...iconProps} color="#66BB6A" />;
      case 'Entertainment':
        return <FontAwesome5 name="gamepad" {...iconProps} color="#FF7043" />;
      case 'Shopping':
        return <Entypo name="shopping-bag" {...iconProps} color="#AB47BC" />;
      case 'Bills and Utilities':
        return <MaterialCommunityIcons name="receipt" {...iconProps} color="#42A5F5" />;
      case 'Investments':
        return <MaterialCommunityIcons name="finance" {...iconProps} color="#26A69A" />;
      default:
        return <Ionicons name="wallet" {...iconProps} color="#78909C" />;
    }
  };

  const getIconBackgroundColor = (categoryName: string) => {
    switch (categoryName) {
      case 'Others': return '#ECEFF1';
      case 'Food and Drinks': return '#C8E6C9';
      case 'Entertainment': return '#FFE0B2';
      case 'Shopping': return '#E1BEE7';
      case 'Bills and Utilities': return '#BBDEFB';
      case 'Investments': return '#B2DFDB';
      default: return '#ECEFF1';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor(item.category) }]}>
        {renderIcon(item.category)}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        <Text style={styles.transactionDate}>{moment(item.date).format('MMM D, YYYY')}</Text>
      </View>
      <Text style={styles.transactionAmount}>-₹{item.amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerCategory}>{categoryName}</Text>
          <Text style={styles.headerMonth}>{month}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Expense</Text>
        <Text style={styles.summaryValue}>-₹{totalExpense}</Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.transactionList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerCategory: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerMonth: {
    fontSize: 14,
    color: '#888',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#444',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53935',
  },
  transactionList: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconContainer: {
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
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
  },
});

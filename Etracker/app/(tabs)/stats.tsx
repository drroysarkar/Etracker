import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function StatsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.monthText}>APRIL 2025</Text>
      
      <View style={styles.incomeExpenseContainer}>
        <Text style={styles.incomeExpenseText}>Income 0%</Text>
        <Text style={styles.incomeExpenseText}>Expense 0%</Text>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Type</Text>
          <Text style={styles.tableHeader}>Amount</Text>
          <Text style={styles.tableHeader}>Transactions</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Income</Text>
          <Text style={styles.tableCell}>0</Text>
          <Text style={styles.tableCell}>0</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Expense</Text>
          <Text style={styles.tableCell}>0</Text>
          <Text style={styles.tableCell}>0</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Overall</Text>
          <Text style={styles.tableCell}>0</Text>
          <Text style={styles.tableCell}>0</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>EXPENSE CATEGORIES BREAKDOWN</Text>
      <View style={styles.divider} />
      
      <Text style={styles.subsectionTitle}>Category</Text>
      <Text style={styles.subsectionSubtitle}>Percentage</Text>
      
      <View style={styles.categoryItem}>
        <Text style={styles.categoryName}>Others</Text>
        <Text style={styles.categoryTransactions}>0 transactions</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  incomeExpenseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  incomeExpenseText: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Inter-Regular',
  },
  table: {
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  tableCell: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
    marginTop: 20,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
    marginBottom: 5,
  },
  subsectionSubtitle: {
    fontSize: 12,
    color: 'gray',
    fontFamily: 'Inter-Regular',
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter-Regular',
  },
  categoryTransactions: {
    fontSize: 12,
    color: 'gray',
    fontFamily: 'Inter-Regular',
  },
});
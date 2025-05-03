import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function MoreScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>More</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accounts</Text>
        <Text style={styles.sectionSubtitle}>Overall: 0</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.accountContainer}>
        <Text style={styles.accountBalance}>0</Text>
        <Text style={styles.accountName}>Main Account</Text>
        <Text style={styles.accountType}>Default</Text>
      </View>
      
      <View style={styles.divider} />
      
      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuItemText}>Categories</Text>
        <Text style={styles.menuItemSubtext}>Add, edit or reorder categories</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuItemText}>Started</Text>
        <Text style={styles.menuItemSubtext}>Quick access to starred transactions</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuItemText}>Sync</Text>
        <Text style={styles.menuItemSubtext}>Backup & restore with Google™ sign in</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuItemText}>Export Transactions</Text>
        <Text style={styles.menuItemSubtext}>Save transactions as a spreadsheet into your device</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuItemText}>Settings</Text>
        <Text style={styles.menuItemSubtext}>Customize app for your preferences</Text>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuItemText}>About</Text>
        <Text style={styles.menuItemSubtext}>What's New - Latest features added in this version</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuItemText}>Rate</Text>
        <Text style={styles.menuItemSubtext}>Helps community to expand users</Text>
      </TouchableOpacity>
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
    marginBottom: 30,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Inter-Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  accountContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  accountBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
  },
  accountName: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Inter-Regular',
    marginTop: 5,
  },
  accountType: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Inter-Regular',
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Inter-Medium',
  },
  menuItemSubtext: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Inter-Regular',
    marginTop: 5,
  },
});
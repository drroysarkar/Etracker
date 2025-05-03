import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import tw from 'twrnc';
import { getSplitBillsByCategory, getSplitBillsAllMonths, updateSplitBill, deleteSplitBill } from '../services/database';
import { Picker } from '@react-native-picker/picker';
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CategoryExpenses = () => {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [groupedBills, setGroupedBills] = useState<any[]>([]);
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);
  const [members, setMembers] = useState(2);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    loadCurrentMonthBills();
    loadAllMonthsBills();
  }, [category]);

  const loadCurrentMonthBills = () => {
    getSplitBillsByCategory(category as string, (results) => {
      setBills(results);
    });
  };

  const loadAllMonthsBills = () => {
    getSplitBillsAllMonths(category as string, (results) => {
      setGroupedBills(results);
    });
  };

  const getCategoryIcon = () => {
    const icons: Record<string, string> = {
      'Rent': 'home',
      'Utilities': 'flash',
      'Groceries': 'cart',
      'Internet': 'wifi',
      'Transportation': 'car',
      'Dining': 'restaurant',
      'Others': 'ellipsis-horizontal'
    };
    return icons[category as string] || 'ellipsis-horizontal';
  };

  const handleEditPress = (bill: any) => {
    setEditingBill(bill);
    setTitle(bill.title);
    setAmount(bill.amount.toString());
    setNote(bill.note || '');
    setMembers(bill.members);
    setModalVisible(true);
  };

  const handleDeletePress = (billId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSplitBill(billId, (success) => {
              if (success) {
                loadCurrentMonthBills();
                loadAllMonthsBills();
              } else {
                Alert.alert('Error', 'Failed to delete expense');
              }
            });
          }
        }
      ]
    );
  };

  const handleSaveExpense = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const now = new Date();
    const date = editingBill?.date || now.toISOString().split('T')[0];
    const time = editingBill?.time || now.toTimeString().split(' ')[0];
    const month = editingBill?.month || now.getMonth() + 1;
    const year = editingBill?.year || now.getFullYear();
    const perPerson = (parseFloat(amount) / members).toFixed(2);

    if (editingBill) {
      // Update existing bill
      updateSplitBill(
        editingBill.id,
        title || `${category} Expense`,
        category as string,
        parseFloat(amount),
        note,
        date,
        time,
        month,
        year,
        members,
        parseFloat(perPerson),
        (success) => {
          if (success) {
            loadCurrentMonthBills();
            loadAllMonthsBills();
            setModalVisible(false);
            resetForm();
          } else {
            Alert.alert('Error', 'Failed to update expense');
          }
        }
      );
    } else {
      // Add new bill
      // (This would be handled in the SplitBillScreen)
    }
  };

  const resetForm = () => {
    setEditingBill(null);
    setTitle('');
    setAmount('');
    setNote('');
    setMembers(2);
  };

  const renderBillItem = ({ item }: { item: any }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={tw`p-4 bg-white rounded-lg shadow-sm mb-2 mx-1`}>
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw`text-lg font-semibold text-gray-800`} numberOfLines={1}>{item.title}</Text>
          <Text style={tw`text-lg font-bold text-indigo-600`}>₹{item.amount.toFixed(2)}</Text>
        </View>
        {item.note && (
          <Text style={tw`text-gray-500 mt-1 text-sm`} numberOfLines={2}>
            {item.note}
          </Text>
        )}
        <View style={tw`flex-row justify-between mt-2`}>
          <Text style={tw`text-xs text-gray-400`}>{item.date} • {item.time}</Text>
          <Text style={tw`text-xs text-gray-400`}>
            {item.members} {item.members > 1 ? 'people' : 'person'} • ₹{item.per_person_amount.toFixed(2)} each
          </Text>
        </View>
        <View style={tw`flex-row justify-end mt-2`}>
          <TouchableOpacity
            style={tw`bg-blue-500 p-2 rounded-full mr-2`}
            onPress={() => handleEditPress(item)}
          >
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-red-500 p-2 rounded-full`}
            onPress={() => handleDeletePress(item.id)}
          >
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  const renderMonthSection = ({ item }: { item: any }) => (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row justify-between items-center bg-indigo-50 p-3 rounded-lg`}>
        <Text style={tw`text-base font-semibold text-indigo-800`}>
          {months[item.month - 1]} {item.year}
        </Text>
        <Text style={tw`text-base font-bold text-indigo-600`}>
          ₹{item.data.reduce((sum: number, bill: any) => sum + bill.amount, 0).toFixed(2)}
        </Text>
      </View>
      <FlatList
        data={item.data}
        renderItem={renderBillItem}
        keyExtractor={(bill) => bill.id}
        style={tw`mt-2`}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`bg-indigo-600 p-4 pt-5 pb-6 rounded-b-3xl shadow-lg items-center`}>
        <View style={tw`flex-row items-center`}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-white p-2 rounded-full mr-3`}>
              <Ionicons 
                name={getCategoryIcon() as any} 
                size={24} 
                color="#4B0082" 
              />
            </View>
            <Text style={tw`text-2xl font-bold text-white`}>{category}</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={tw`flex-row mx-4 mt-6 mb-4 bg-white rounded-full p-1 shadow-sm`}>
        <TouchableOpacity
          style={[
            tw`flex-1 py-2 rounded-full items-center`,
            activeTab === 'current' && tw`bg-indigo-100`
          ]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[
            tw`font-medium`,
            activeTab === 'current' ? tw`text-indigo-700` : tw`text-gray-500`
          ]}>
            Current Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            tw`flex-1 py-2 rounded-full items-center`,
            activeTab === 'all' && tw`bg-indigo-100`
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            tw`font-medium`,
            activeTab === 'all' ? tw`text-indigo-700` : tw`text-gray-500`
          ]}>
            All Expenses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={tw`flex-1 px-4`}>
        {activeTab === 'current' ? (
          <>
            <Text style={tw`text-lg font-semibold text-gray-700 mb-3`}>
              {months[currentMonth - 1]} {currentYear}
            </Text>
            {bills.length > 0 ? (
              <FlatList
                data={bills}
                renderItem={renderBillItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={tw`bg-white p-6 rounded-xl items-center justify-center mt-4`}>
                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" style={tw`mb-3`} />
                <Text style={tw`text-gray-500 text-center text-lg`}>No expenses this month</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={tw`text-lg font-semibold text-gray-700 mb-3`}>All Expenses</Text>
            {groupedBills.length > 0 ? (
              <FlatList
                data={groupedBills}
                renderItem={renderMonthSection}
                keyExtractor={(item) => `${item.year}-${item.month}`}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={tw`bg-white p-6 rounded-xl items-center justify-center mt-4`}>
                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" style={tw`mb-3`} />
                <Text style={tw`text-gray-500 text-center text-lg`}>No expenses recorded</Text>
              </View>
            )}
          </>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg`}>
            <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>
              {editingBill ? 'Edit Expense' : 'Add New Expense'}
            </Text>
            
            <Text style={tw`text-lg font-semibold text-gray-700 mb-1`}>Category: {category}</Text>
            
            <TextInput
              style={tw`bg-gray-100 rounded-lg p-3 mb-4 text-lg`}
              placeholder="Title (optional)"
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={tw`bg-gray-100 rounded-lg p-3 mb-4 text-lg`}
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={tw`bg-gray-100 rounded-lg p-3 mb-4`}>
              <Text style={tw`text-gray-700 mb-1`}>Number of Members</Text>
              <Picker
                selectedValue={members}
                onValueChange={(value: number) => setMembers(value)}
                style={tw`bg-white`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Picker.Item key={num} label={`${num} ${num === 1 ? 'Person' : 'People'}`} value={num} />
                ))}
              </Picker>
            </View>
            
            <TextInput
              style={tw`bg-gray-100 rounded-lg p-3 mb-6 text-lg`}
              placeholder="Note (optional)"
              multiline
              value={note}
              onChangeText={setNote}
            />
            
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                style={tw`bg-gray-300 rounded-lg p-3 flex-1 mr-2`}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={tw`text-center text-lg font-semibold text-gray-800`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-indigo-500 rounded-lg p-3 flex-1 ml-2`}
                onPress={handleSaveExpense}
              >
                <Text style={tw`text-center text-lg font-semibold text-white`}>
                  {editingBill ? 'Update' : 'Add'} Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryExpenses;
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, Alert, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import tw from 'twrnc';
import { addSplitBill, getSplitBillsAllMonths, addUserCategory, getUserCategories, deleteUserCategory } from '../services/database';

const defaultCategories = [
  { name: 'Rent', icon: 'home' },
  { name: 'Utilities', icon: 'flash' },
  { name: 'Groceries', icon: 'cart' },
  { name: 'Internet', icon: 'wifi' },
  { name: 'Transportation', icon: 'car' },
  { name: 'Dining', icon: 'restaurant' },
  { name: 'Others', icon: 'ellipsis-horizontal' },
];

const availableIcons = [
  'home', 'flash', 'cart', 'wifi', 'car', 'restaurant', 'airplane', 'medical', 
  'gift', 'shirt', 'book', 'school', 'fitness', 'beer', 'cafe', 'pizza',
  'bus', 'train', 'bed', 'cut', 'color-palette', 'game-controller', 'headset',
  'musical-notes', 'film', 'camera', 'phone-portrait', 'laptop', 'tv', 'watch'
];

export default function SplitBillScreen() {
  const [members, setMembers] = useState(2);
  const [allSplitBills, setAllSplitBills] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState(defaultCategories);
  const [userCategories, setUserCategories] = useState<{name: string, icon: string}[]>([]);
  const [selectedIcon, setSelectedIcon] = useState('ellipsis-horizontal');
  const [iconModalVisible, setIconModalVisible] = useState(false);

  useEffect(() => {
    loadCategories();
    loadAllSplitBills();
  }, []);

  const loadAllSplitBills = () => {
    getSplitBillsAllMonths('', (results) => {
      const allBills = results.flatMap(monthGroup => monthGroup.data);
      setAllSplitBills(allBills);
    });
  };

  const loadCategories = () => {
    getUserCategories((results) => {
      setUserCategories(results);
      setCategories([...defaultCategories, ...results, { name: 'Add New', icon: 'add' }]);
    });
  };

  const getCategoryTotal = (category: string) => {
    return allSplitBills
      .filter((bill) => bill.category === category)
      .reduce((sum, bill) => sum + bill.amount, 0)
      .toFixed(2);
  };

  const totalAmount = categories
    .filter(cat => cat.name !== 'Add New')
    .reduce((sum, cat) => sum + parseFloat(getCategoryTotal(cat.name)), 0)
    .toFixed(2);

  const handleAddExpense = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const perPerson = (parseFloat(amount) / members).toFixed(2);

    addSplitBill(
      title || `${selectedCategory} Expense`,
      selectedCategory,
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
          loadAllSplitBills();
          setModalVisible(false);
          setAmount('');
          setTitle('');
          setNote('');
        } else {
          Alert.alert('Error', 'Failed to add split bill');
        }
      }
    );
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    addUserCategory(
      newCategoryName.trim(),
      selectedIcon,
      (success) => {
        if (success) {
          setNewCategoryName('');
          setSelectedIcon('ellipsis-horizontal');
          setCategoryModalVisible(false);
          loadCategories();
        } else {
          Alert.alert('Error', 'Failed to add category');
        }
      }
    );
  };

  const handleDeleteCategory = (categoryName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteUserCategory(
              categoryName,
              (success) => {
                if (success) {
                  loadCategories();
                } else {
                  Alert.alert('Error', 'Failed to delete category');
                }
              }
            );
          }
        }
      ]
    );
  };

  const handleCategoryPress = (category: string) => {
    if (category === 'Add New') {
      setCategoryModalVisible(true);
      return;
    }
    
    router.push({
      pathname: '/CategoryExpenses',
      params: { category }
    });
  };

  const renderCategory = ({ item }: { item: { name: string; icon: string } }) => (
    <Pressable
      onPress={() => handleCategoryPress(item.name)}
      onLongPress={() => {
        if (item.name !== 'Add New' && !defaultCategories.some(cat => cat.name === item.name)) {
          handleDeleteCategory(item.name);
        }
      }}
      style={tw`flex-row items-center justify-between p-4 bg-gray-100 rounded-lg mb-2 shadow-sm`}
    >
      <View style={tw`flex-row items-center`}>
        <Ionicons 
          name={item.icon as any} 
          size={24} 
          color={item.name === 'Add New' ? '#4CAF50' : '#4B0082'} 
          style={tw`mr-3`} 
        />
        <Text style={tw`text-lg font-semibold ${item.name === 'Add New' ? 'text-green-600' : 'text-gray-800'}`}>
          {item.name}
        </Text>
      </View>
      {item.name !== 'Add New' && (
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-lg font-bold text-indigo-600 mr-3`}>₹{getCategoryTotal(item.name)}</Text>
          <TouchableOpacity
            style={tw`bg-indigo-500 rounded-full p-2`}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedCategory(item.name);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </Pressable>
  );

  const renderIconItem = (icon: string) => (
    <TouchableOpacity
      key={icon}
      style={tw`p-3 m-1 rounded-full ${selectedIcon === icon ? 'bg-indigo-100' : 'bg-gray-100'}`}
      onPress={() => {
        setSelectedIcon(icon);
        setIconModalVisible(false);
      }}
    >
      <Ionicons name={icon as any} size={24} color="#4B0082" />
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-white`}>

      {/* Members Picker */}
      <View style={tw`bg-gray-100 rounded-lg p-3 mx-4 my-3 shadow-sm`}>
        <Text style={tw`text-lg font-semibold text-gray-700 mb-2`}>Number of Members</Text>
        <Picker
          selectedValue={members}
          onValueChange={(value) => setMembers(value)}
          style={tw`bg-white rounded-lg`}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <Picker.Item key={num} label={`${num} ${num === 1 ? 'Person' : 'People'}`} value={num} />
          ))}
        </Picker>
      </View>

      {/* Categories List */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        showsVerticalScrollIndicator={false}
        style={tw`flex-1 px-4`}
        contentContainerStyle={tw`pb-4`}
      />

      {/* Total and Split Button */}
      <View style={tw`mt-6 p-4 mx-4 bg-indigo-50 rounded-lg shadow-md`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>
          Total: <Text style={tw`text-indigo-600`}>₹{totalAmount}</Text>
        </Text>
        <TouchableOpacity
          style={tw`mt-4 bg-indigo-500 rounded-lg p-3 items-center`}
          onPress={() => {
            const perPerson = (parseFloat(totalAmount) / members).toFixed(2);
            Alert.alert('Split Bill', `Total: ₹${totalAmount}\nEach person pays: ₹${perPerson}`);
          }}
        >
          <Text style={tw`text-lg font-semibold text-white`}>Split Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg`}>
            <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>Add New Expense</Text>
            
            <Text style={tw`text-lg font-semibold text-gray-700 mb-1`}>Category: {selectedCategory}</Text>
            
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
                onPress={() => setModalVisible(false)}
              >
                <Text style={tw`text-center text-lg font-semibold text-gray-800`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-indigo-500 rounded-lg p-3 flex-1 ml-2`}
                onPress={handleAddExpense}
              >
                <Text style={tw`text-center text-lg font-semibold text-white`}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg`}>
            <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>Add New Category</Text>
            <TextInput
              style={tw`bg-gray-100 rounded-lg p-3 mb-4 text-lg`}
              placeholder="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            
            <TouchableOpacity
              style={tw`bg-gray-100 rounded-lg p-3 mb-4 flex-row items-center`}
              onPress={() => setIconModalVisible(true)}
            >
              <Ionicons name={selectedIcon as any} size={24} color="#4B0082" style={tw`mr-3`} />
              <Text style={tw`text-gray-700`}>Select Icon</Text>
            </TouchableOpacity>
            
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                style={tw`bg-gray-300 rounded-lg p-3 flex-1 mr-2`}
                onPress={() => {
                  setCategoryModalVisible(false);
                  setSelectedIcon('ellipsis-horizontal');
                }}
              >
                <Text style={tw`text-center text-lg font-semibold text-gray-800`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-green-500 rounded-lg p-3 flex-1 ml-2`}
                onPress={handleAddCategory}
              >
                <Text style={tw`text-center text-lg font-semibold text-white`}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Icon Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={iconModalVisible}
        onRequestClose={() => setIconModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg max-h-96`}>
            <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>Select Icon</Text>
            <View style={tw`flex-row flex-wrap justify-center`}>
              {availableIcons.map(icon => renderIconItem(icon))}
            </View>
            <TouchableOpacity
              style={tw`mt-4 bg-indigo-500 rounded-lg p-3`}
              onPress={() => setIconModalVisible(false)}
            >
              <Text style={tw`text-center text-lg font-semibold text-white`}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
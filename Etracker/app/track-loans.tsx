import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import tw from 'twrnc';
import * as Contacts from 'expo-contacts';
import { format } from 'date-fns';
import { addLoan, getLoans, deleteLoan, getLoansByContact, updateLoan } from '../services/database';

interface Loan {
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
}

export default function TrackLoansScreen() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedContactLoans, setSelectedContactLoans] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    id: '',
    contactName: '',
    contactNumber: '',
    amount: '',
    title: '',
    note: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        fetchLoans();
      }
    })();
  }, []);

  const fetchLoans = () => {
    getLoans((loans) => setLoans(loans));
  };

  const fetchContacts = async () => {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
    });
    setContacts(data);
    setContactModalVisible(true);
  };

  const handleAddLoan = () => {
    if (!form.contactName || !form.amount || !form.title) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    const date = new Date();
    addLoan(
      form.contactName,
      form.contactNumber,
      amount,
      form.title,
      form.note,
      format(date, 'yyyy-MM-dd'),
      format(date, 'HH:mm'),
      date.getMonth() + 1,
      date.getFullYear(),
      (success) => {
        if (success) {
          setModalVisible(false);
          setForm({ id: '', contactName: '', contactNumber: '', amount: '', title: '', note: '' });
          fetchLoans();
        } else {
          Alert.alert('Error', 'Failed to add loan');
        }
      }
    );
  };

  const handleUpdateLoan = () => {
    if (!form.contactName || !form.amount || !form.title) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    const date = new Date();
    updateLoan(
      form.id,
      form.contactName,
      form.contactNumber,
      amount,
      form.title,
      form.note,
      format(date, 'yyyy-MM-dd'),
      format(date, 'HH:mm'),
      date.getMonth() + 1,
      date.getFullYear(),
      (success) => {
        if (success) {
          setModalVisible(false);
          setForm({ id: '', contactName: '', contactNumber: '', amount: '', title: '', note: '' });
          setIsEditing(false);
          fetchLoans();
        } else {
          Alert.alert('Error', 'Failed to update loan');
        }
      }
    );
  };

  const handleDeleteLoan = (id: string) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this loan?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => {
          deleteLoan(id, (success) => {
            if (success) fetchLoans();
            else Alert.alert('Error', 'Failed to delete loan');
          });
        },
      },
    ]);
  };

  const handleEditLoan = (loan: Loan) => {
    setIsEditing(true);
    setForm({
      id: loan.id,
      contactName: loan.contact_name,
      contactNumber: loan.contact_number,
      amount: loan.amount.toString(),
      title: loan.title,
      note: loan.note || '',
    });
    setModalVisible(true);
  };

  const handleContactSelect = (contact: any) => {
    setForm({
      ...form,
      contactName: contact.name,
      contactNumber: contact.phoneNumbers?.[0]?.number || '',
    });
    setContactModalVisible(false);
  };

  const handleCardPress = (contactName: string) => {
    getLoansByContact(contactName, (groupedLoans) => {
      setSelectedContactLoans(groupedLoans);
      setDetailModalVisible(true);
    });
  };

  const renderLoanCard = ({ item }: { item: Loan }) => (
    <TouchableOpacity
      style={tw`bg-white rounded-xl p-4 m-2 shadow-md`}
      onPress={() => handleCardPress(item.contact_name)}
    >
      <View style={tw`flex-row justify-between`}>
        <View>
          <Text style={tw`text-base text-gray-600 mt-1 font-bold`}>To: {item.contact_name}</Text>
          <Text style={tw`text-lg font-bold text-gray-800 mt-1`}>{item.title}</Text>
          <Text style={tw`text-base text-gray-600 mt-1`}>{item.note || 'No note'}</Text>
          <Text style={tw`text-base text-gray-600`}>
            {format(new Date(item.date), 'MMM dd, yyyy')} • {item.time}
          </Text>
        </View>
        <View style={tw`items-end`}>
          <Text style={tw`text-xl font-bold text-green-600`}>₹{item.amount.toFixed(2)}</Text>
          <View style={tw`flex-row mt-2`}>
            <TouchableOpacity onPress={() => handleEditLoan(item)} style={tw`mr-2`}>
              <Ionicons name="pencil" size={20} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteLoan(item.id)}>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Modal visible={detailModalVisible} animationType="slide">
      <View style={tw`flex-1 bg-gray-100 p-4`}>
        <View style={tw`flex-row items-center mb-4`}>
          <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={tw`text-xl font-bold ml-2`}>
            {selectedContactLoans[0]?.data[0]?.contact_name || 'Contact'}'s Loans
          </Text>
        </View>
        <FlatList
          data={selectedContactLoans}
          keyExtractor={(item) => `${item.year}-${item.month}`}
          renderItem={({ item }) => (
            <View style={tw`mb-4`}>
              <Text style={tw`text-lg font-bold mb-2`}>
                {format(new Date(item.year, item.month - 1), 'MMMM yyyy')}
              </Text>
              {item.data.map((loan: Loan) => (
                <View key={loan.id} style={tw`bg-white rounded-xl p-4 mb-2 shadow-sm`}>
                  <Text style={tw`text-base text-gray-600`}>
                    {format(new Date(loan.date), 'MMM dd, yyyy')} • {loan.time}
                  </Text>
                  <Text style={tw`text-base font-bold mt-1`}>{loan.title}</Text>
                  <Text style={tw`text-base text-gray-600 mt-1`}>{loan.note || 'No note'}</Text>
                  <Text style={tw`text-base font-bold text-green-600 mt-1`}>₹{loan.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        />
      </View>
    </Modal>
  );

  return (
    <View style={tw`flex-1 bg-gray-100`}>
        <View style={tw`p-4 bg-blue-400 shadow-md rounded-lg mb-4`}>
            <Text style={tw`text-xl font-bold text-center`}>Track Given Loans</Text>
            <Text style={tw`text-gray-600 mt-1 text-center`}>Manage your loans and debts easily.</Text>
        </View>

      <FlatList
        data={loans}
        renderItem={renderLoanCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`p-4`}
      />

      <TouchableOpacity
        style={tw`absolute bottom-8 right-8 bg-green-500 rounded-full p-4 shadow-lg`}
        onPress={() => {
          setIsEditing(false);
          setForm({ id: '', contactName: '', contactNumber: '', amount: '', title: '', note: '' });
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={tw`flex-1 bg-gray-100 p-4`}>
          <View style={tw`flex-row items-center mb-4`}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={tw`text-xl font-bold ml-2`}>
              {isEditing ? 'Edit Loan' : 'Add New Loan'}
            </Text>
          </View>

          <View style={tw`bg-white rounded-xl p-4 mb-4  shadow-sm`}>
            <View style={tw`flex-row items-center mb-4`}>
              <TextInput
                style={tw`flex-1 text-base border-b border-gray-300 p-2`}
                placeholder="Name *"
                value={form.contactName}
                onChangeText={(text) => setForm({ ...form, contactName: text })}
              />
              <TouchableOpacity onPress={fetchContacts} style={tw`ml-2`}>
                <Ionicons name="person-circle-outline" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={tw`text-base border-b border-gray-300 p-2 mb-4`}
              placeholder="Phone Number"
              value={form.contactNumber}
              onChangeText={(text) => setForm({ ...form, contactNumber: text })}
              keyboardType="phone-pad"
            />
            <TextInput
              style={tw`text-base border-b border-gray-300 p-2 mb-4`}
              placeholder="Amount *"
              value={form.amount}
              onChangeText={(text) => setForm({ ...form, amount: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={tw`text-base border-b border-gray-300 p-2 mb-4`}
              placeholder="Title *"
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
            />
            <TextInput
              style={tw`text-base border-b border-gray-300 p-2 mb-4`}
              placeholder="Note"
              value={form.note}
              onChangeText={(text) => setForm({ ...form, note: text })}
              multiline
            />
            <TouchableOpacity
              style={tw`bg-green-500 rounded-lg p-3 items-center`}
              onPress={isEditing ? handleUpdateLoan : handleAddLoan}
            >
              <Text style={tw`text-white text-base font-bold`}>
                {isEditing ? 'Update Loan' : 'Add Loan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={contactModalVisible} animationType="slide">
        <View style={tw`flex-1 bg-gray-100 p-4`}>
          <View style={tw`flex-row items-center mb-4`}>
            <TouchableOpacity onPress={() => setContactModalVisible(false)}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={tw`text-xl font-bold ml-2`}>Select Contact</Text>
          </View>
          <TextInput
            style={tw`bg-white rounded-lg p-2 mb-4 border border-gray-300`}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={contacts.filter((contact) =>
              contact.name.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={tw`bg-white rounded-lg p-3 mb-2 shadow-sm`}
                onPress={() => handleContactSelect(item)}
              >
                <Text style={tw`text-base font-bold`}>{item.name}</Text>
                <Text style={tw`text-sm text-gray-600`}>
                  {item.phoneNumbers?.[0]?.number || 'No number'}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {renderDetailModal()}
    </View>
  );
}
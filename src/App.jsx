import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import ContactManager from './components/ContactManager.jsx';
import JourneySetup from './components/JourneySetup.jsx';
import ActiveJourney from './components/ActiveJourney.jsx';
import AlertScreen from './components/AlertScreen.jsx';
import SafeArrivalModal from './components/SafeArrivalModal.jsx';
import { getDeviceLocation } from './services/location.js';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [journeyState, setJourneyState] = useState('IDLE'); // 'IDLE' | 'ACTIVE' | 'ALERT'
  const [journeyData, setJourneyData] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [isSafeArrivalModalOpen, setIsSafeArrivalModalOpen] = useState(false);

  // Initialize Contacts from localStorage or pre-seed demo contact
  useEffect(() => {
    const saved = localStorage.getItem('guardian_contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch {
        seedDefaultContacts();
      }
    } else {
      seedDefaultContacts();
    }
  }, []);

  const seedDefaultContacts = () => {
    const initial = [
      {
        id: 'contact_default_1',
        name: 'Alex Smith',
        phone: '+91 9876543210',
        email: 'alex@example.com',
        relationship: 'Partner / Spouse',
        isPrimary: true
      }
    ];
    setContacts(initial);
    localStorage.setItem('guardian_contacts', JSON.stringify(initial));
  };

  const saveContacts = (updated) => {
    setContacts(updated);
    localStorage.setItem('guardian_contacts', JSON.stringify(updated));
  };

  const handleAddContact = (newContact) => {
    const updated = [...contacts, newContact];
    saveContacts(updated);
  };

  const handleDeleteContact = (id) => {
    let updated = contacts.filter((c) => c.id !== id);
    if (updated.length > 0 && !updated.some((c) => c.isPrimary)) {
      updated[0].isPrimary = true;
    }
    saveContacts(updated);
  };

  const handleSelectPrimaryContact = (id) => {
    const updated = contacts.map((c) => ({
      ...c,
      isPrimary: c.id === id
    }));
    saveContacts(updated);
  };

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  const handleStartJourney = async (data) => {
    setJourneyData(data);
    setJourneyState('ACTIVE');
    setAlertData(null);

    // Prompt location immediately on user click gesture
    const locationData = await getDeviceLocation();
    setJourneyData((prev) => ({ ...prev, location: locationData }));
  };

  const handleTriggerAlert = (data) => {
    setAlertData(data);
    setJourneyState('ALERT');
  };

  const handleSafeArrival = () => {
    setIsSafeArrivalModalOpen(true);
  };

  const handleCloseSafeArrival = () => {
    setIsSafeArrivalModalOpen(false);
    setJourneyState('IDLE');
    setJourneyData(null);
    setAlertData(null);
  };

  const handleResetJourney = () => {
    setJourneyState('IDLE');
    setJourneyData(null);
    setAlertData(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar
        journeyState={journeyState}
        contactsCount={contacts.length}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {journeyState === 'IDLE' && (
          <div className="space-y-8">
            <JourneySetup
              onStartJourney={handleStartJourney}
              primaryContact={primaryContact}
            />
            <div className="max-w-3xl mx-auto">
              <ContactManager
                contacts={contacts}
                onAddContact={handleAddContact}
                onDeleteContact={handleDeleteContact}
                onSelectPrimary={handleSelectPrimaryContact}
              />
            </div>
          </div>
        )}

        {journeyState === 'ACTIVE' && (
          <ActiveJourney
            journeyData={journeyData}
            primaryContact={primaryContact}
            onTriggerAlert={handleTriggerAlert}
            onSafeArrival={handleSafeArrival}
          />
        )}

        {journeyState === 'ALERT' && (
          <AlertScreen
            alertData={alertData}
            primaryContact={primaryContact}
            onResetJourney={handleResetJourney}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <p>Guardian SafetyNet • Built with React, Vite & Gemini AI • Hackathon Phase 1</p>
      </footer>

      <SafeArrivalModal
        isOpen={isSafeArrivalModalOpen}
        onClose={handleCloseSafeArrival}
        destination={journeyData?.destination}
      />
    </div>
  );
}

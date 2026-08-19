import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import ContactManager from './components/ContactManager.jsx';
import JourneySetup from './components/JourneySetup.jsx';
import ActiveJourney from './components/ActiveJourney.jsx';
import AlertScreen from './components/AlertScreen.jsx';
import SafeArrivalModal from './components/SafeArrivalModal.jsx';
import { getDeviceLocation } from './services/location.js';
import { 
  subscribeAuthState, 
  logoutUser, 
  subscribeUserContacts, 
  addContactToCloud, 
  deleteContactFromCloud, 
  updatePrimaryContactInCloud 
} from './services/firebase.js';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [contacts, setContacts] = useState([]);
  const [journeyState, setJourneyState] = useState('IDLE'); // 'IDLE' | 'ACTIVE' | 'ALERT'
  const [journeyData, setJourneyData] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [isSafeArrivalModalOpen, setIsSafeArrivalModalOpen] = useState(false);

  // 1. Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = subscribeAuthState((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Realtime Firestore Sync for User's Contacts (users/{uid}/contacts)
  useEffect(() => {
    if (!user) {
      setContacts([]);
      return;
    }

    const unsubscribe = subscribeUserContacts(user.uid, (cloudContacts) => {
      setContacts(cloudContacts);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddContact = async (newContact) => {
    if (user) {
      await addContactToCloud(user.uid, newContact);
    }
  };

  const handleDeleteContact = async (id) => {
    if (user) {
      await deleteContactFromCloud(user.uid, id);
    }
  };

  const handleSelectPrimaryContact = async (id) => {
    if (user) {
      await updatePrimaryContactInCloud(user.uid, id, contacts);
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
    setJourneyState('IDLE');
    setJourneyData(null);
    setAlertData(null);
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

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400 font-medium">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Initializing Guardian Security...</span>
        </div>
      </div>
    );
  }

  // Show Login Screen if not authenticated
  if (!user) {
    return <LoginScreen onLoginSuccess={() => setAuthLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar
        journeyState={journeyState}
        contactsCount={contacts.length}
        user={user}
        onSignOut={handleSignOut}
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
            contacts={contacts}
            primaryContact={primaryContact}
            onTriggerAlert={handleTriggerAlert}
            onSafeArrival={handleSafeArrival}
          />
        )}

        {journeyState === 'ALERT' && (
          <AlertScreen
            alertData={alertData}
            contacts={contacts}
            primaryContact={primaryContact}
            onResetJourney={handleResetJourney}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <p>Guardian SafetyNet • Built with React, Vite & Gemini AI • Firebase Cloud Sync Active</p>
      </footer>

      <SafeArrivalModal
        isOpen={isSafeArrivalModalOpen}
        onClose={handleCloseSafeArrival}
        destination={journeyData?.destination}
      />
    </div>
  );
}

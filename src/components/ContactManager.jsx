import React, { useState } from 'react';
import { UserPlus, Phone, Mail, User, Trash2, CheckCircle2, HeartHandshake } from 'lucide-react';

export default function ContactManager({ contacts, onAddContact, onDeleteContact, onSelectPrimary }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Friend / Family');

  const [submitted, setSubmitted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Validation rules
  const isNameValid = name.trim().length > 0;
  
  // Phone: strictly 10 digits (Indian format)
  const isPhoneValid = phone.length === 10;

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());

  const isFormValid = isNameValid && isPhoneValid && isEmailValid;

  const handlePhoneChange = (e) => {
    // Strip all non-digit characters and limit strictly to 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isFormValid) return;

    onAddContact({
      id: 'contact_' + Date.now(),
      name: name.trim(),
      phone: '+91 ' + phone,
      email: email.trim(),
      relationship: relationship,
      isPrimary: contacts.length === 0
    });

    setName('');
    setPhone('');
    setEmail('');
    setSubmitted(false);
    setNameTouched(false);
    setPhoneTouched(false);
    setEmailTouched(false);
    setShowAddForm(false);
  };

  const showNameError = (submitted || nameTouched) && !isNameValid;
  const showPhoneError = (submitted || phoneTouched) && !isPhoneValid;
  const showEmailError = (submitted || emailTouched) && !isEmailValid;

  return (
    <div className="glass-panel p-5 sm:p-6 border border-slate-800 bg-slate-900/60 rounded-2xl">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Trusted Contacts</h3>
            <p className="text-xs text-slate-400">Notified instantly if distress is detected</p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setSubmitted(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'Close' : 'Add Contact'}</span>
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} noValidate className="mb-5 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3.5 animate-fadeIn">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">New Safety Contact</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onBlur={() => setNameTouched(true)}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-900 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all ${
                  showNameError
                    ? 'border-2 border-rose-500 focus:border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                    : 'border border-slate-700 focus:border-emerald-500'
                }`}
              />
              {showNameError && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium animate-fadeIn">
                  ⚠️ Full name is required.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number (10 digits) *</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  maxLength={10}
                  onBlur={() => setPhoneTouched(true)}
                  onChange={handlePhoneChange}
                  className={`w-full px-3 py-2 rounded-lg bg-slate-900 text-sm text-slate-100 placeholder-slate-600 focus:outline-none font-mono transition-all ${
                    showPhoneError
                      ? 'border-2 border-rose-500 focus:border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                      : 'border border-slate-700 focus:border-emerald-500'
                  }`}
                />
                <span className="absolute right-2.5 top-2.5 text-[10px] font-mono text-slate-500">
                  {phone.length}/10
                </span>
              </div>
              {showPhoneError && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium animate-fadeIn">
                  ⚠️ Phone number must be exactly 10 digits.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="e.g. alex@example.com"
                value={email}
                onBlur={() => setEmailTouched(true)}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-900 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all ${
                  showEmailError
                    ? 'border-2 border-rose-500 focus:border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                    : 'border border-slate-700 focus:border-emerald-500'
                }`}
              />
              {showEmailError && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium animate-fadeIn">
                  ⚠️ Valid email address required (e.g. name@domain.com).
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Friend / Family">Friend / Family</option>
                <option value="Partner / Spouse">Partner / Spouse</option>
                <option value="Roommate">Roommate</option>
                <option value="Parent / Guardian">Parent / Guardian</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setSubmitted(false);
              }}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all"
            >
              Save Contact
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-2.5">
        {contacts.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
            <User className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-400">No trusted contacts added yet.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Add a contact to receive instant alert dispatches.</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectPrimary(contact.id)}
              className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                contact.isPrimary
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm shadow-emerald-950/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    contact.isPrimary
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> PRIMARY DISPATCH
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" /> {contact.phone}
                      </span>
                    )}
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" /> {contact.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {contacts.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteContact(contact.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Remove Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

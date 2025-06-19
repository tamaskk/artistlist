import React, { useState } from "react";

interface UserSettings {
  email: string;
  name: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    email: '',
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: 'en',
    theme: 'system',
  });

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (settings.newPassword !== settings.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (settings.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    // Here you would typically make an API call to update the password
    console.log('Password update requested');
    setIsEditingPassword(false);
    setSettings(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to save the settings
    console.log('Settings update requested:', settings);
  };

  return (
    <div className="bg-white max-h-screen overflow-y-auto p-4 w-full">
      <form onSubmit={handleSaveSettings}>
        <div className="space-y-12">
          {/* Account Settings Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">Account Settings</h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Update your account information and manage your password.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* Name */}
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={settings.name}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                  Email Address
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={settings.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="sm:col-span-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Password</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingPassword(!isEditingPassword)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {isEditingPassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {isEditingPassword && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-900">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={settings.currentPassword}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={settings.newPassword}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={settings.confirmPassword}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                      />
                    </div>
                    {passwordError && (
                      <p className="text-sm text-red-600">{passwordError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appearance Settings Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">Appearance</h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Customize how the application looks and feels.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* Theme Selection */}
              <div className="sm:col-span-3">
                <label htmlFor="theme" className="block text-sm/6 font-medium text-gray-900">
                  Theme
                </label>
                <div className="mt-2">
                  <select
                    name="theme"
                    id="theme"
                    value={settings.theme}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  >
                    {THEMES.map(theme => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Language Settings Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">Language</h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Choose your preferred language for the application.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* Language Selection */}
              <div className="sm:col-span-3">
                <label htmlFor="language" className="block text-sm/6 font-medium text-gray-900">
                  Language
                </label>
                <div className="mt-2">
                  <select
                    name="language"
                    id="language"
                    value={settings.language}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code} className="flex items-center gap-2">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm/6 font-semibold text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

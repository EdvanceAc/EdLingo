import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, RefreshCw, Database, Mail, Shield, Globe, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Slider } from '../ui/Slider';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'EdLingo Learning Platform',
      siteDescription: 'Interactive language learning application',
      defaultLanguage: 'en',
      timezone: 'UTC',
      maintenanceMode: false
    },
    database: {
      host: 'localhost',
      port: 5432,
      name: 'lingo_db',
      maxConnections: 100,
      connectionTimeout: 30,
      autoBackup: true,
      backupFrequency: 'daily'
    },
    email: {
      provider: 'smtp',
      host: 'smtp.gmail.com',
      port: 587,
      username: '',
      password: '',
      fromAddress: 'noreply@lingo.com',
      enableNotifications: true
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireSpecialChars: true,
      enableRateLimiting: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReports: true,
      systemAlerts: true,
      userRegistrations: true
    },
    performance: {
      cacheEnabled: true,
      cacheDuration: 3600,
      compressionEnabled: true,
      cdnEnabled: false,
      maxFileSize: 10
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    // Load settings from API or localStorage
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Simulate API call
      console.log('Loading admin settings...');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Database connection successful!');
    } catch (error) {
      alert('Database connection failed!');
    }
  };

  const testEmailConfiguration = async () => {
    try {
      console.log('Testing email configuration...');
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Test email sent successfully!');
    } catch (error) {
      alert('Email test failed!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h2>
        <div className="flex gap-2">
          {lastSaved && (
            <span className="text-sm text-gray-500 self-center">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={saveSettings} disabled={isSaving} className="flex items-center gap-2">
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Site Name</label>
              <Input
                value={settings.general.siteName}
                onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Site Description</label>
              <textarea
                value={settings.general.siteDescription}
                onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Default Language</label>
              <Select 
                value={settings.general.defaultLanguage} 
                onValueChange={(value) => updateSetting('general', 'defaultLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Maintenance Mode</label>
              <Switch
                checked={settings.general.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Host</label>
                <Input
                  value={settings.database.host}
                  onChange={(e) => updateSetting('database', 'host', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Port</label>
                <Input
                  type="number"
                  value={settings.database.port}
                  onChange={(e) => updateSetting('database', 'port', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Database Name</label>
              <Input
                value={settings.database.name}
                onChange={(e) => updateSetting('database', 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Connections: {settings.database.maxConnections}</label>
              <Slider
                value={[settings.database.maxConnections]}
                onValueChange={([value]) => updateSetting('database', 'maxConnections', value)}
                max={200}
                min={10}
                step={10}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto Backup</label>
              <Switch
                checked={settings.database.autoBackup}
                onCheckedChange={(checked) => updateSetting('database', 'autoBackup', checked)}
              />
            </div>
            <Button onClick={testDatabaseConnection} variant="outline" className="w-full">
              Test Connection
            </Button>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">SMTP Host</label>
                <Input
                  value={settings.email.host}
                  onChange={(e) => updateSetting('email', 'host', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Port</label>
                <Input
                  type="number"
                  value={settings.email.port}
                  onChange={(e) => updateSetting('email', 'port', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                value={settings.email.username}
                onChange={(e) => updateSetting('email', 'username', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={settings.email.password}
                onChange={(e) => updateSetting('email', 'password', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">From Address</label>
              <Input
                value={settings.email.fromAddress}
                onChange={(e) => updateSetting('email', 'fromAddress', e.target.value)}
              />
            </div>
            <Button onClick={testEmailConfiguration} variant="outline" className="w-full">
              Send Test Email
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Two-Factor Authentication</label>
              <Switch
                checked={settings.security.enableTwoFactor}
                onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Session Timeout (minutes): {settings.security.sessionTimeout}</label>
              <Slider
                value={[settings.security.sessionTimeout]}
                onValueChange={([value]) => updateSetting('security', 'sessionTimeout', value)}
                max={240}
                min={15}
                step={15}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Login Attempts</label>
              <Input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password Min Length</label>
              <Input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Require Special Characters</label>
              <Switch
                checked={settings.security.requireSpecialChars}
                onCheckedChange={(checked) => updateSetting('security', 'requireSpecialChars', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email Notifications</label>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Push Notifications</label>
              <Switch
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Weekly Reports</label>
              <Switch
                checked={settings.notifications.weeklyReports}
                onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">System Alerts</label>
              <Switch
                checked={settings.notifications.systemAlerts}
                onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">User Registrations</label>
              <Switch
                checked={settings.notifications.userRegistrations}
                onCheckedChange={(checked) => updateSetting('notifications', 'userRegistrations', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Performance Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Caching</label>
              <Switch
                checked={settings.performance.cacheEnabled}
                onCheckedChange={(checked) => updateSetting('performance', 'cacheEnabled', checked)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cache Duration (seconds): {settings.performance.cacheDuration}</label>
              <Slider
                value={[settings.performance.cacheDuration]}
                onValueChange={([value]) => updateSetting('performance', 'cacheDuration', value)}
                max={86400}
                min={300}
                step={300}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Compression</label>
              <Switch
                checked={settings.performance.compressionEnabled}
                onCheckedChange={(checked) => updateSetting('performance', 'compressionEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">CDN Enabled</label>
              <Switch
                checked={settings.performance.cdnEnabled}
                onCheckedChange={(checked) => updateSetting('performance', 'cdnEnabled', checked)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max File Size (MB): {settings.performance.maxFileSize}</label>
              <Slider
                value={[settings.performance.maxFileSize]}
                onValueChange={([value]) => updateSetting('performance', 'maxFileSize', value)}
                max={100}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
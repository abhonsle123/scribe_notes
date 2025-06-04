
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Settings as SettingsIcon, Save, FileText, Clock, Trash2 } from "lucide-react";

interface UserSettings {
  summary_template: string;
  custom_template: string | null;
  data_retention_days: number;
  auto_delete_enabled: boolean;
}

interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  template_content: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    summary_template: 'discharge_summary',
    custom_template: null,
    data_retention_days: 3,
    auto_delete_enabled: true
  });
  const [templatePresets, setTemplatePresets] = useState<TemplatePreset[]>([]);
  const [customTemplate, setCustomTemplate] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const retentionOptions = [
    { value: 1, label: "1 Hour", description: "Delete after 1 hour" },
    { value: 24, label: "1 Day", description: "Delete after 1 day" },
    { value: 72, label: "3 Days", description: "Delete after 3 days (recommended)" },
    { value: 168, label: "7 Days", description: "Delete after 1 week" },
    { value: 720, label: "30 Days", description: "Delete after 1 month" },
    { value: -1, label: "Never", description: "Manual deletion only" }
  ];

  useEffect(() => {
    if (user) {
      loadSettings();
      loadTemplatePresets();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setIsCustom(data.summary_template === 'custom');
        setCustomTemplate(data.custom_template || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplatePresets = async () => {
    try {
      const { data, error } = await supabase
        .from('template_presets')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplatePresets(data || []);
    } catch (error) {
      console.error('Error loading template presets:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const settingsToSave = {
        ...settings,
        summary_template: isCustom ? 'custom' : settings.summary_template,
        custom_template: isCustom ? customTemplate : null,
        data_retention_days: settings.data_retention_days === -1 ? null : settings.data_retention_days
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settingsToSave,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateChange = (value: string) => {
    if (value === 'custom') {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setSettings(prev => ({ ...prev, summary_template: value }));
    }
  };

  const getSelectedPreset = () => {
    return templatePresets.find(preset => preset.name === settings.summary_template);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your summary templates and data retention preferences</p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Summary Template
            </CardTitle>
            <CardDescription>
              Choose how your medical summaries are structured and formatted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-select">Template Type</Label>
              <Select 
                value={isCustom ? 'custom' : settings.summary_template} 
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templatePresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.name}>
                      {preset.description}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isCustom && getSelectedPreset() && (
              <div className="space-y-2">
                <Label>Template Preview</Label>
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                  {getSelectedPreset()?.template_content}
                </div>
              </div>
            )}

            {isCustom && (
              <div className="space-y-2">
                <Label htmlFor="custom-template">Custom Template</Label>
                <Textarea
                  id="custom-template"
                  placeholder="Enter your custom template instructions for the AI..."
                  value={customTemplate}
                  onChange={(e) => setCustomTemplate(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  This template will be used to instruct the AI on how to structure and format your summaries.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Retention Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Data Retention
            </CardTitle>
            <CardDescription>
              Control how long your summaries and files are stored
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-delete summaries</Label>
                <p className="text-sm text-gray-500">
                  Automatically delete old summaries based on retention period
                </p>
              </div>
              <Switch
                checked={settings.auto_delete_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, auto_delete_enabled: checked }))
                }
              />
            </div>

            {settings.auto_delete_enabled && (
              <div className="space-y-2">
                <Label htmlFor="retention-period">Retention Period</Label>
                <Select 
                  value={settings.data_retention_days?.toString() || '3'}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, data_retention_days: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    {retentionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-gray-500">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <Trash2 className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">Data Privacy Notice</p>
                  <p className="text-yellow-700 mt-1">
                    For privacy and compliance, we recommend keeping the retention period short. 
                    Medical data will be permanently deleted after the specified period.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            Account Settings
          </CardTitle>
          <CardDescription>
            General account preferences and information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={user?.email || ''} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Input value="Healthcare Professional" disabled className="bg-gray-50" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

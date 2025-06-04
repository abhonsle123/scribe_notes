
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Settings as SettingsIcon, 
  FileText, 
  Clock, 
  Save, 
  RotateCcw,
  Eye,
  Edit3
} from "lucide-react";

interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  template_content: string;
}

interface UserSettings {
  summary_template: string;
  custom_template: string | null;
  data_retention_days: number;
  auto_delete_enabled: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    summary_template: 'discharge_summary',
    custom_template: null,
    data_retention_days: 3,
    auto_delete_enabled: true
  });
  
  const [templatePresets, setTemplatePresets] = useState<TemplatePreset[]>([]);
  const [customTemplate, setCustomTemplate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('discharge_summary');

  const retentionOptions = [
    { value: 1, label: '1 Day' },
    { value: 3, label: '3 Days' },
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' },
    { value: -1, label: 'Never (Manual Delete)' }
  ];

  useEffect(() => {
    loadSettings();
    loadTemplatePresets();
  }, []);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
        setSelectedTemplate(data.summary_template);
        setCustomTemplate(data.custom_template || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplatePresets = async () => {
    try {
      const { data, error } = await supabase
        .from('template_presets')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading template presets:', error);
        return;
      }

      setTemplatePresets(data || []);
    } catch (error) {
      console.error('Error loading template presets:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const settingsData = {
        user_id: user.id,
        summary_template: selectedTemplate,
        custom_template: selectedTemplate === 'custom' ? customTemplate : null,
        data_retention_days: settings.data_retention_days,
        auto_delete_enabled: settings.auto_delete_enabled,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      summary_template: 'discharge_summary',
      custom_template: null,
      data_retention_days: 3,
      auto_delete_enabled: true
    });
    setSelectedTemplate('discharge_summary');
    setCustomTemplate('');
  };

  const getCurrentTemplate = () => {
    if (selectedTemplate === 'custom') {
      return customTemplate;
    }
    const preset = templatePresets.find(t => t.name === selectedTemplate);
    return preset?.template_content || '';
  };

  const getTemplatePreview = () => {
    const template = getCurrentTemplate();
    return template.replace('[PATIENT_NAME]', 'John Smith');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure your summary templates and data retention preferences
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </Button>
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Summary Templates</span>
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Data Retention</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary Template Configuration</CardTitle>
              <CardDescription>
                Choose how your patient summaries are formatted. You can use preset templates or create your own custom template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="template-select">Template Type</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templatePresets.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.description}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate === 'custom' && (
                <div className="space-y-4">
                  <Label htmlFor="custom-template">Custom Template</Label>
                  <Textarea
                    id="custom-template"
                    placeholder="Enter your custom template here. Use [PATIENT_NAME] as a placeholder for the patient's name."
                    value={customTemplate}
                    onChange={(e) => setCustomTemplate(e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                  <p className="text-sm text-gray-600">
                    Use <code className="bg-gray-100 px-1 rounded">[PATIENT_NAME]</code> as a placeholder for the patient's name.
                  </p>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Label>Template Preview</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center space-x-2"
                  >
                    {previewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{previewMode ? 'Edit' : 'Preview'}</span>
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  {previewMode ? (
                    <div className="whitespace-pre-wrap font-mono text-sm">
                      {getTemplatePreview()}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm">
                      {getCurrentTemplate()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Settings</CardTitle>
              <CardDescription>
                Configure how long summaries and voice files are stored in the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Automatic Deletion</Label>
                  <p className="text-sm text-gray-600">
                    Automatically delete summaries and files after the retention period
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
                <div className="space-y-4">
                  <Label htmlFor="retention-period">Retention Period</Label>
                  <Select 
                    value={settings.data_retention_days.toString()} 
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
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    {settings.data_retention_days === -1 
                      ? 'Files will be kept until manually deleted'
                      : `Files will be automatically deleted after ${settings.data_retention_days} day${settings.data_retention_days !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-400 rounded-full p-1">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800">Important Note</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Deleted files cannot be recovered. Make sure to download any important summaries before they are automatically deleted.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

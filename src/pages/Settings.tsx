
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Settings as SettingsIcon, Save, FileText, Clock, Trash2, Plus, Check } from "lucide-react";

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

interface CustomTemplate {
  id: string;
  name: string;
  template_content: string;
  created_at: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    summary_template: 'discharge_summary',
    custom_template: null,
    data_retention_days: 3,
    auto_delete_enabled: true
  });
  const [templatePresets, setTemplatePresets] = useState<TemplatePreset[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [customTemplate, setCustomTemplate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
      loadCustomTemplates();
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
        setSelectedTemplate(data.summary_template);
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

  const loadCustomTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('user_custom_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomTemplates(data || []);
    } catch (error) {
      console.error('Error loading custom templates:', error);
    }
  };

  const confirmTemplateSelection = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const settingsToSave = {
        ...settings,
        summary_template: selectedTemplate,
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

      setSettings(settingsToSave);
      setHasUnsavedChanges(false);

      toast({
        title: "Template Confirmed",
        description: "Your template selection has been saved and will be used for new summaries.",
      });
    } catch (error) {
      console.error('Error confirming template:', error);
      toast({
        title: "Error",
        description: "Failed to confirm template selection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const settingsToSave = {
        ...settings,
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

  const saveCustomTemplate = async () => {
    if (!user || !newTemplateName.trim() || !newTemplateContent.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please provide both a name and content for your template.",
        variant: "destructive"
      });
      return;
    }

    if (customTemplates.length >= 5) {
      toast({
        title: "Template Limit Reached",
        description: "You can only save up to 5 custom templates. Please delete one first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_custom_templates')
        .insert({
          user_id: user.id,
          name: newTemplateName.trim(),
          template_content: newTemplateContent.trim()
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('A template with this name already exists');
        }
        throw error;
      }

      await loadCustomTemplates();
      setNewTemplateName("");
      setNewTemplateContent("");
      setSaveDialogOpen(false);

      toast({
        title: "Template Saved",
        description: `Custom template "${newTemplateName}" has been saved.`,
      });
    } catch (error: any) {
      console.error('Error saving custom template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save custom template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteCustomTemplate = async (templateId: string, templateName: string) => {
    try {
      const { error } = await supabase
        .from('user_custom_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await loadCustomTemplates();

      toast({
        title: "Template Deleted",
        description: `Custom template "${templateName}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting custom template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    setHasUnsavedChanges(true);
    
    if (value === 'custom') {
      setIsCustom(true);
    } else if (value.startsWith('custom_')) {
      setIsCustom(true);
      const customTemplateId = value.replace('custom_', '');
      const template = customTemplates.find(t => t.id === customTemplateId);
      if (template) {
        setCustomTemplate(template.template_content);
      }
    } else {
      setIsCustom(false);
    }
  };

  const getSelectedPreset = () => {
    return templatePresets.find(preset => preset.name === selectedTemplate);
  };

  const getCurrentTemplateDisplay = () => {
    if (selectedTemplate === 'custom') {
      return customTemplate || 'No custom template content';
    } else if (selectedTemplate.startsWith('custom_')) {
      const customTemplateId = selectedTemplate.replace('custom_', '');
      const template = customTemplates.find(t => t.id === customTemplateId);
      return template?.template_content || 'Template not found';
    } else {
      const preset = getSelectedPreset();
      return preset?.template_content || 'Template not found';
    }
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
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templatePresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.name}>
                      {preset.description}
                    </SelectItem>
                  ))}
                  {customTemplates.map((template) => (
                    <SelectItem key={template.id} value={`custom_${template.id}`}>
                      {template.name} (Custom)
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">New Custom Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-template">Custom Template</Label>
                <Textarea
                  id="custom-template"
                  placeholder="Enter your custom template instructions for the AI..."
                  value={customTemplate}
                  onChange={(e) => {
                    setCustomTemplate(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  This template will be used to instruct the AI on how to structure and format your summaries.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Current Template Preview</Label>
              <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 max-h-40 overflow-y-auto">
                {getCurrentTemplateDisplay()}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={confirmTemplateSelection}
                disabled={isSaving || !hasUnsavedChanges}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {isSaving ? 'Confirming...' : 'Confirm Template'}
              </Button>
              
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={customTemplates.length >= 5}>
                    <Plus className="h-4 w-4 mr-2" />
                    Save as Custom ({customTemplates.length}/5)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Custom Template</DialogTitle>
                    <DialogDescription>
                      Create a new custom template that you can reuse later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        placeholder="My Custom Template"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-content">Template Content</Label>
                      <Textarea
                        id="template-content"
                        placeholder="Enter your template instructions..."
                        value={newTemplateContent}
                        onChange={(e) => setNewTemplateContent(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveCustomTemplate}>Save Template</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {customTemplates.length > 0 && (
              <div className="space-y-2">
                <Label>Your Custom Templates</Label>
                <div className="space-y-2">
                  {customTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">{template.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCustomTemplate(template.id, template.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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

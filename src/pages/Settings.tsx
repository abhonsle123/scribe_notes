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
import { 
  Settings as SettingsIcon, 
  Save, 
  FileText, 
  Clock, 
  Trash2, 
  Plus, 
  Check,
  Palette,
  Shield,
  User,
  Sparkles,
  Heart,
  Stethoscope
} from "lucide-react";

interface UserSettings {
  summary_template: string;
  custom_template: string | null;
  clinical_notes_template: string;
  custom_clinical_template: string | null;
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
    clinical_notes_template: 'soap_format',
    custom_clinical_template: null,
    data_retention_days: 3,
    auto_delete_enabled: true
  });
  const [templatePresets, setTemplatePresets] = useState<TemplatePreset[]>([]);
  const [clinicalNotesPresets, setClinicalNotesPresets] = useState<TemplatePreset[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [customClinicalTemplates, setCustomClinicalTemplates] = useState<CustomTemplate[]>([]);
  const [customTemplate, setCustomTemplate] = useState("");
  const [customClinicalTemplate, setCustomClinicalTemplate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedClinicalTemplate, setSelectedClinicalTemplate] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [newClinicalTemplateName, setNewClinicalTemplateName] = useState("");
  const [newClinicalTemplateContent, setNewClinicalTemplateContent] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isClinicalCustom, setIsClinicalCustom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveClinicalDialogOpen, setSaveClinicalDialogOpen] = useState(false);
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
        setSelectedClinicalTemplate(data.clinical_notes_template || 'soap_format');
        setIsCustom(data.summary_template === 'custom');
        setIsClinicalCustom(data.clinical_notes_template === 'custom');
        setCustomTemplate(data.custom_template || '');
        setCustomClinicalTemplate(data.custom_clinical_template || '');
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
      
      // Separate summary templates from clinical notes templates
      const summaryTemplates = (data || []).filter(template => 
        !template.name.includes('clinical') && !template.name.includes('soap')
      );
      const clinicalTemplates = (data || []).filter(template => 
        template.name.includes('clinical') || template.name.includes('soap')
      );
      
      setTemplatePresets(summaryTemplates);
      setClinicalNotesPresets(clinicalTemplates);
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
      
      // Separate summary templates from clinical templates based on name or content
      const summaryTemplates = (data || []).filter(template => 
        !template.name.toLowerCase().includes('clinical') && !template.name.toLowerCase().includes('soap')
      );
      const clinicalTemplates = (data || []).filter(template => 
        template.name.toLowerCase().includes('clinical') || template.name.toLowerCase().includes('soap')
      );
      
      setCustomTemplates(summaryTemplates);
      setCustomClinicalTemplates(clinicalTemplates);
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

  const confirmClinicalTemplateSelection = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const settingsToSave = {
        ...settings,
        clinical_notes_template: selectedClinicalTemplate,
        custom_clinical_template: isClinicalCustom ? customClinicalTemplate : null,
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
        title: "Clinical Notes Template Confirmed",
        description: "Your clinical notes template selection has been saved and will be used for new transcriptions.",
      });
    } catch (error) {
      console.error('Error confirming clinical template:', error);
      toast({
        title: "Error",
        description: "Failed to confirm clinical notes template selection. Please try again.",
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

  const saveCustomClinicalTemplate = async () => {
    if (!user || !newClinicalTemplateName.trim() || !newClinicalTemplateContent.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please provide both a name and content for your clinical template.",
        variant: "destructive"
      });
      return;
    }

    if (customClinicalTemplates.length >= 5) {
      toast({
        title: "Template Limit Reached",
        description: "You can only save up to 5 custom clinical templates. Please delete one first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_custom_templates')
        .insert({
          user_id: user.id,
          name: newClinicalTemplateName.trim(),
          template_content: newClinicalTemplateContent.trim()
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('A template with this name already exists');
        }
        throw error;
      }

      await loadCustomTemplates();
      setNewClinicalTemplateName("");
      setNewClinicalTemplateContent("");
      setSaveClinicalDialogOpen(false);

      toast({
        title: "Clinical Template Saved",
        description: `Custom clinical template "${newClinicalTemplateName}" has been saved.`,
      });
    } catch (error: any) {
      console.error('Error saving custom clinical template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save custom clinical template. Please try again.",
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

  const handleClinicalTemplateChange = (value: string) => {
    setSelectedClinicalTemplate(value);
    setHasUnsavedChanges(true);
    
    if (value === 'custom') {
      setIsClinicalCustom(true);
    } else if (value.startsWith('custom_')) {
      setIsClinicalCustom(true);
      const customTemplateId = value.replace('custom_', '');
      const template = customClinicalTemplates.find(t => t.id === customTemplateId);
      if (template) {
        setCustomClinicalTemplate(template.template_content);
      }
    } else {
      setIsClinicalCustom(false);
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

  const getCurrentClinicalTemplateDisplay = () => {
    if (selectedClinicalTemplate === 'custom') {
      return customClinicalTemplate || 'No custom clinical template content';
    } else if (selectedClinicalTemplate.startsWith('custom_')) {
      const customTemplateId = selectedClinicalTemplate.replace('custom_', '');
      const template = customClinicalTemplates.find(t => t.id === customTemplateId);
      return template?.template_content || 'Template not found';
    } else {
      const preset = clinicalNotesPresets.find(preset => preset.name === selectedClinicalTemplate);
      return preset?.template_content || 'Default SOAP format will be used';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-turquoise to-sky-blue rounded-2xl mx-auto mb-6 animate-pulse-gentle flex items-center justify-center">
            <SettingsIcon className="h-8 w-8 text-white animate-spin" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Loading Settings
          </h1>
          <p className="text-gray-600">Preparing your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Settings
            </h1>
            <p className="text-xl text-gray-600">Customize your summary templates and preferences</p>
          </div>
          <Button 
            onClick={saveSettings} 
            disabled={isSaving} 
            className="bg-gradient-to-r from-turquoise to-sky-blue hover:from-turquoise/90 hover:to-sky-blue/90 text-white rounded-full px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Summary Templates */}
          <Card className="glass-card border-0 shadow-xl hover-lift">
            <CardHeader className="bg-gradient-to-r from-turquoise/5 to-sky-blue/5 rounded-t-xl">
              <CardTitle className="flex items-center text-2xl">
                <div className="p-2 bg-gradient-to-br from-turquoise/10 to-sky-blue/10 rounded-xl mr-3">
                  <Palette className="h-6 w-6 text-turquoise" />
                </div>
                Patient Summary Templates
              </CardTitle>
              <CardDescription className="text-lg">
                Choose how your patient summaries are structured and formatted
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="template-select" className="text-base font-semibold text-gray-700">Template Type</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="border-2 border-gray-200 rounded-xl h-12 text-base">
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
                    <SelectItem value="custom">Create New Custom Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate === 'custom' && (
                <div className="space-y-3">
                  <Label htmlFor="custom-template" className="text-base font-semibold text-gray-700">Custom Template</Label>
                  <Textarea
                    id="custom-template"
                    placeholder="Enter your custom template instructions for the AI..."
                    value={customTemplate}
                    onChange={(e) => {
                      setCustomTemplate(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="min-h-[150px] border-2 border-gray-200 rounded-xl text-base"
                  />
                  <p className="text-sm text-gray-500">
                    This template will guide the AI on how to structure and format your summaries.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">Current Template Preview</Label>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-xl border border-gray-200 text-sm text-gray-700 max-h-48 overflow-y-auto">
                  {getCurrentTemplateDisplay()}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={confirmTemplateSelection}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full px-6 py-3"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isSaving ? 'Confirming...' : 'Confirm Template'}
                </Button>
                
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      disabled={customTemplates.length >= 5}
                      className="border-2 border-turquoise/20 text-turquoise hover:bg-turquoise/5 rounded-full px-6 py-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Save as Custom ({customTemplates.length}/5)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Save Custom Template</DialogTitle>
                      <DialogDescription className="text-base">
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
                          className="border-2 border-gray-200 rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-content">Template Content</Label>
                        <Textarea
                          id="template-content"
                          placeholder="Enter your template instructions..."
                          value={newTemplateContent}
                          onChange={(e) => setNewTemplateContent(e.target.value)}
                          className="min-h-[120px] border-2 border-gray-200 rounded-xl"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSaveDialogOpen(false)} className="rounded-full">
                        Cancel
                      </Button>
                      <Button onClick={saveCustomTemplate} className="bg-turquoise hover:bg-turquoise/90 text-white rounded-full">
                        Save Template
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {customTemplates.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">Your Custom Templates</Label>
                  <div className="space-y-2">
                    {customTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
                        <span className="font-medium text-gray-800">{template.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCustomTemplate(template.id, template.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
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

          {/* Clinical Notes Templates */}
          <Card className="glass-card border-0 shadow-xl hover-lift">
            <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-t-xl">
              <CardTitle className="flex items-center text-2xl">
                <div className="p-2 bg-gradient-to-br from-emerald-100/80 to-teal-100/80 rounded-xl mr-3">
                  <Stethoscope className="h-6 w-6 text-emerald-600" />
                </div>
                Clinical Notes Templates
              </CardTitle>
              <CardDescription className="text-lg">
                Customize the formatting of clinical notes from voice transcriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="clinical-template-select" className="text-base font-semibold text-gray-700">Clinical Notes Format</Label>
                <Select value={selectedClinicalTemplate} onValueChange={handleClinicalTemplateChange}>
                  <SelectTrigger className="border-2 border-gray-200 rounded-xl h-12 text-base">
                    <SelectValue placeholder="Select a clinical notes template" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinicalNotesPresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.name}>
                        {preset.description}
                      </SelectItem>
                    ))}
                    {customClinicalTemplates.map((template) => (
                      <SelectItem key={template.id} value={`custom_${template.id}`}>
                        {template.name} (Custom)
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Create New Clinical Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedClinicalTemplate === 'custom' && (
                <div className="space-y-3">
                  <Label htmlFor="custom-clinical-template" className="text-base font-semibold text-gray-700">Custom Clinical Template</Label>
                  <Textarea
                    id="custom-clinical-template"
                    placeholder="Enter your custom clinical notes template instructions for the AI..."
                    value={customClinicalTemplate}
                    onChange={(e) => {
                      setCustomClinicalTemplate(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="min-h-[150px] border-2 border-gray-200 rounded-xl text-base"
                  />
                  <p className="text-sm text-gray-500">
                    This template will guide the AI on how to structure and format your clinical notes from transcriptions.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">Current Clinical Template Preview</Label>
                <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 p-6 rounded-xl border border-gray-200 text-sm text-gray-700 max-h-48 overflow-y-auto">
                  {getCurrentClinicalTemplateDisplay()}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={confirmClinicalTemplateSelection}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full px-6 py-3"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isSaving ? 'Confirming...' : 'Confirm Template'}
                </Button>
                
                <Dialog open={saveClinicalDialogOpen} onOpenChange={setSaveClinicalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      disabled={customClinicalTemplates.length >= 5}
                      className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-full px-6 py-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Save Clinical Template ({customClinicalTemplates.length}/5)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Save Custom Clinical Template</DialogTitle>
                      <DialogDescription className="text-base">
                        Create a new custom clinical notes template that you can reuse later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="clinical-template-name">Template Name</Label>
                        <Input
                          id="clinical-template-name"
                          placeholder="My Clinical Template"
                          value={newClinicalTemplateName}
                          onChange={(e) => setNewClinicalTemplateName(e.target.value)}
                          className="border-2 border-gray-200 rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clinical-template-content">Template Content</Label>
                        <Textarea
                          id="clinical-template-content"
                          placeholder="Enter your clinical notes template instructions..."
                          value={newClinicalTemplateContent}
                          onChange={(e) => setNewClinicalTemplateContent(e.target.value)}
                          className="min-h-[120px] border-2 border-gray-200 rounded-xl"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSaveClinicalDialogOpen(false)} className="rounded-full">
                        Cancel
                      </Button>
                      <Button onClick={saveCustomClinicalTemplate} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
                        Save Template
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {customClinicalTemplates.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">Your Custom Clinical Templates</Label>
                  <div className="space-y-2">
                    {customClinicalTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-xl border border-gray-100">
                        <span className="font-medium text-gray-800">{template.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCustomTemplate(template.id, template.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
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
          <Card className="glass-card border-0 shadow-xl hover-lift">
            <CardHeader className="bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-t-xl">
              <CardTitle className="flex items-center text-2xl">
                <div className="p-2 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-xl mr-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                Data Retention
              </CardTitle>
              <CardDescription className="text-lg">
                Control how long your summaries and files are stored
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="space-y-1">
                  <Label className="text-base font-semibold text-gray-700">Auto-delete summaries</Label>
                  <p className="text-sm text-gray-600">
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
                <div className="space-y-3">
                  <Label htmlFor="retention-period" className="text-base font-semibold text-gray-700">Retention Period</Label>
                  <Select 
                    value={settings.data_retention_days?.toString() || '3'}
                    onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, data_retention_days: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="border-2 border-gray-200 rounded-xl h-12">
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

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex">
                  <Shield className="h-6 w-6 text-amber-600 mt-1 mr-3" />
                  <div>
                    <p className="font-semibold text-amber-800 text-base mb-2">Data Privacy Notice</p>
                    <p className="text-amber-700">
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
        <Card className="glass-card border-0 shadow-xl max-w-4xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
            <CardTitle className="flex items-center text-2xl">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl mr-3">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
              Account Information
            </CardTitle>
            <CardDescription className="text-lg">
              Your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">Email Address</Label>
                <Input 
                  value={user?.email || ''} 
                  disabled 
                  className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-2 border-gray-200 rounded-xl h-12"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">Account Type</Label>
                <Input 
                  value="Healthcare Professional" 
                  disabled 
                  className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-2 border-gray-200 rounded-xl h-12"
                />
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-turquoise/5 to-sky-blue/5 rounded-xl border border-turquoise/20">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-turquoise" />
                <div>
                  <p className="font-semibold text-gray-800 text-lg">Thank you for using Liaise!</p>
                  <p className="text-gray-600">You're helping make healthcare more accessible and understandable for patients.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

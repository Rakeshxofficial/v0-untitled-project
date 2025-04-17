"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Trash2, Plus, Save, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

interface TaskButton {
  id: string
  label: string
  url: string
  icon: string
}

interface TaskPopupConfig {
  id: string
  enabled: boolean
  buttons: TaskButton[]
  target_apps: string[] | null
  remember_completion: boolean
}

interface App {
  id: string
  title: string
}

export default function TaskPopupAdmin() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<TaskPopupConfig>({
    id: "task-popup-config",
    enabled: false,
    buttons: [],
    target_apps: null,
    remember_completion: true,
  })
  const [apps, setApps] = useState<App[]>([])
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const [targetMode, setTargetMode] = useState<"all" | "specific">("all")

  // Icon options for the dropdown
  const iconOptions = [
    { value: "telegram", label: "Telegram" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "twitter", label: "Twitter" },
    { value: "facebook", label: "Facebook" },
    { value: "tiktok", label: "TikTok" },
  ]

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Fetch task popup configuration
      const { data: configData, error: configError } = await supabase
        .from("task_popup_config")
        .select("*")
        .eq("id", "task-popup-config")
        .single()

      if (configError && configError.code !== "PGSQL_ERROR") {
        console.error("Error fetching task popup config:", configError)
        toast({
          title: "Error",
          description: "Failed to load task popup configuration",
          variant: "destructive",
        })
      }

      // Fetch apps for targeting
      const { data: appsData, error: appsError } = await supabase
        .from("apps")
        .select("id, title")
        .eq("status", "published")
        .order("title")

      if (appsError) {
        console.error("Error fetching apps:", appsError)
      }

      if (configData) {
        setConfig(configData)
        if (configData.target_apps) {
          setSelectedApps(configData.target_apps)
          setTargetMode("specific")
        } else {
          setTargetMode("all")
        }
      }

      if (appsData) {
        setApps(appsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    setSaving(true)

    // Prepare data for saving
    const dataToSave = {
      ...config,
      target_apps: targetMode === "specific" ? selectedApps : null,
    }

    // Save to Supabase
    const { error } = await supabase.from("task_popup_config").upsert(dataToSave)

    if (error) {
      console.error("Error saving task popup config:", error)
      toast({
        title: "Error",
        description: "Failed to save task popup configuration",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Task popup configuration saved successfully",
      })
    }

    setSaving(false)
  }

  const addButton = () => {
    const newButton = {
      id: `button-${Date.now()}`,
      label: "New Button",
      url: "https://",
      icon: "telegram",
    }

    setConfig({
      ...config,
      buttons: [...config.buttons, newButton],
    })
  }

  const removeButton = (id: string) => {
    setConfig({
      ...config,
      buttons: config.buttons.filter((button) => button.id !== id),
    })
  }

  const updateButton = (id: string, field: keyof TaskButton, value: string) => {
    setConfig({
      ...config,
      buttons: config.buttons.map((button) => (button.id === id ? { ...button, [field]: value } : button)),
    })
  }

  const handleAppSelection = (appId: string) => {
    if (selectedApps.includes(appId)) {
      setSelectedApps(selectedApps.filter((id) => id !== appId))
    } else {
      setSelectedApps([...selectedApps, appId])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="container p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Task Popup Configuration</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="buttons">Button Management</TabsTrigger>
          <TabsTrigger value="targeting">App Targeting</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure the basic settings for the task popup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-popup" className="text-base font-medium">
                    Enable Task Popup
                  </Label>
                  <p className="text-sm text-gray-500">Turn the task popup on or off globally</p>
                </div>
                <Switch
                  id="enable-popup"
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="remember-completion" className="text-base font-medium">
                    Remember Task Completion
                  </Label>
                  <p className="text-sm text-gray-500">Hide popup permanently after user completes all tasks</p>
                </div>
                <Switch
                  id="remember-completion"
                  checked={config.remember_completion}
                  onCheckedChange={(checked) => setConfig({ ...config, remember_completion: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buttons">
          <Card>
            <CardHeader>
              <CardTitle>Button Management</CardTitle>
              <CardDescription>Add, edit, or remove buttons that appear in the task popup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.buttons.map((button, index) => (
                  <div key={button.id} className="flex flex-col gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Button {index + 1}</h3>
                      <Button variant="ghost" size="icon" onClick={() => removeButton(button.id)}>
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`button-label-${button.id}`}>Button Label</Label>
                        <Input
                          id={`button-label-${button.id}`}
                          value={button.label}
                          onChange={(e) => updateButton(button.id, "label", e.target.value)}
                          placeholder="Join Telegram"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`button-url-${button.id}`}>Button URL</Label>
                        <Input
                          id={`button-url-${button.id}`}
                          value={button.url}
                          onChange={(e) => updateButton(button.id, "url", e.target.value)}
                          placeholder="https://t.me/yourchannel"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`button-icon-${button.id}`}>Button Icon</Label>
                      <Select value={button.icon} onValueChange={(value) => updateButton(button.id, "icon", value)}>
                        <SelectTrigger id={`button-icon-${button.id}`}>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                <Button onClick={addButton} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting">
          <Card>
            <CardHeader>
              <CardTitle>App Targeting</CardTitle>
              <CardDescription>Choose which apps will display the task popup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="target-all"
                    checked={targetMode === "all"}
                    onCheckedChange={() => setTargetMode("all")}
                  />
                  <Label htmlFor="target-all" className="font-medium">
                    Show on all apps
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="target-specific"
                    checked={targetMode === "specific"}
                    onCheckedChange={() => setTargetMode("specific")}
                  />
                  <Label htmlFor="target-specific" className="font-medium">
                    Show only on specific apps
                  </Label>
                </div>
              </div>

              {targetMode === "specific" && (
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {apps.map((app) => (
                      <div key={app.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`app-${app.id}`}
                          checked={selectedApps.includes(app.id)}
                          onCheckedChange={() => handleAppSelection(app.id)}
                        />
                        <Label htmlFor={`app-${app.id}`}>{app.title}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

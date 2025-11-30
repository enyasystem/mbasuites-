import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mail, Bell, Calendar, Tag } from "lucide-react";

export function EmailPreferences() {
  const [preferences, setPreferences] = useState({
    bookingConfirmation: true,
    bookingReminders: true,
    promotions: true,
    newsletter: false,
    pushNotifications: true,
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated",
      });
      setSaving(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications from us</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="booking-confirmation">Booking Confirmations</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails when your booking is confirmed
                </p>
              </div>
            </div>
            <Switch
              id="booking-confirmation"
              checked={preferences.bookingConfirmation}
              onCheckedChange={() => handleToggle("bookingConfirmation")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="booking-reminders">Booking Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders before your check-in date
                </p>
              </div>
            </div>
            <Switch
              id="booking-reminders"
              checked={preferences.bookingReminders}
              onCheckedChange={() => handleToggle("bookingReminders")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="promotions">Special Offers & Promotions</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about exclusive deals
                </p>
              </div>
            </div>
            <Switch
              id="promotions"
              checked={preferences.promotions}
              onCheckedChange={() => handleToggle("promotions")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="newsletter">Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Monthly updates and travel tips
                </p>
              </div>
            </div>
            <Switch
              id="newsletter"
              checked={preferences.newsletter}
              onCheckedChange={() => handleToggle("newsletter")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in your browser
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.pushNotifications}
              onCheckedChange={() => handleToggle("pushNotifications")}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}

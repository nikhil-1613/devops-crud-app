import { useEffect, useRef, useState } from "react";
import { Camera, Save, User, Mail, Loader2 } from "lucide-react";
import api from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);

  useEffect(() => {
    api.get("/profile").then((r) => {
      const u = r.data.user;
      setForm({ name: u.name, email: u.email });
      setAvatarPreview(u.avatar_url);
      updateUser(u);
    });
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const r = await api.put("/profile", { name: form.name, email: form.email });
      updateUser(r.data.user);
      toast.success("Profile updated", "Your details have been saved.");
    } catch (err) {
      toast.error("Update failed", err.response?.data?.error || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const r = await api.post("/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(r.data.user);
      setAvatarPreview(r.data.user.avatar_url);
      toast.success("Avatar updated", "Your profile picture has been changed.");
    } catch (err) {
      toast.error("Upload failed", err.response?.data?.error || "Could not upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage your account details</p>
      </div>

      {/* Avatar card */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Profile Picture</CardTitle>
          <CardDescription>Click the avatar to upload a new photo (max 5 MB)</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20 ring-2 ring-border">
              <AvatarImage src={avatarPreview} />
              <AvatarFallback className="text-xl">{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Change photo"
            >
              {avatarUploading
                ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                : <Camera className="h-5 w-5 text-white" />
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="flex-1 space-y-1">
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {memberSince && (
              <p className="text-xs text-muted-foreground">Member since {memberSince}</p>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={avatarUploading}>
            {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Change photo
          </Button>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
          <CardDescription>Update your name and email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="prof-name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Full name
              </Label>
              <Input
                id="prof-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prof-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input
                id="prof-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={profileSaving} className="gap-2">
                {profileSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : <><Save className="h-4 w-4" /> Save changes</>
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

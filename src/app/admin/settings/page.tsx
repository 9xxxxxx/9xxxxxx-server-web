"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api-client";
import { SiteConfig } from "@/lib/site-config";
import { Loader2, Save, Image as ImageIcon, User, CheckCircle2, Plus, X } from "lucide-react";
import { getAssetUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import ImageCropper from "@/components/admin/ImageCropper";

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [ownerName, setOwnerName] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [avatarImage, setAvatarImage] = useState("");
  const [avatarInitial, setAvatarInitial] = useState("");
  const [avatarGradient, setAvatarGradient] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  
  // Image cropping state
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    fetchAPI<SiteConfig>("/api/site-config")
      .then((data) => {
        setConfig(data);
        setOwnerName(data.ownerName);
        setSiteTitle(data.siteTitle || "");
        setAvatarImage(data.avatarImage || "");
        setAvatarInitial(data.avatarInitial);
        setAvatarGradient(data.avatarGradient);
        setCategories(data.availableCategories || []);
      })
      .catch((err) => console.error("Failed to load settings", err))
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    setTempImageUrl(tempUrl);
    setShowCropper(true);
  };
  
  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
        const blob = await fetch(croppedImageUrl).then(r => r.blob());
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append("file", file);
        
        const token = JSON.parse(localStorage.getItem("admin-auth-storage") || '{}')?.state?.accessToken;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/upload`, {
            method: "POST",
            headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
            body: formData
        });
        
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        setAvatarImage(data.url);
        setShowCropper(false);
        setTempImageUrl(null);
    } catch (err) {
        alert("Image upload failed");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
        const payload = {
            ownerName,
            siteTitle,
            avatarImage: avatarImage || null,
            avatarInitial,
            avatarGradient,
            availableCategories: categories
        };

        const updated = await fetchAPI<SiteConfig>("/api/site-config", {
            method: "PUT",
            body: JSON.stringify(payload)
        });
        
        setConfig(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
        console.error("Save error:", error);
        alert("Failed to save settings");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>;

  return (
    <>
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 mt-1">Manage your profile and site configuration</p>
         </div>
         <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70"
         >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {success ? "Saved!" : "Save Changes"}
         </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
         {/* Profile Section */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8 relative overflow-hidden"
         >
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
             
             <div className="flex items-start gap-8 flex-col md:flex-row">
                 {/* Avatar Editor */}
                 <div className="flex-shrink-0 space-y-4">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Avatar</label>
                     <div className="relative group">
                        <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-4xl font-bold`}>
                            {avatarImage ? (
                                <img src={getAssetUrl(avatarImage)} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{avatarInitial}</span>
                            )}
                        </div>
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <ImageIcon className="w-8 h-8" />
                        </label>
                     </div>
                     <p className="text-xs text-slate-400 text-center max-w-[8rem]">Click to upload new avatar</p>
                 </div>

                 {/* Inputs */}
                 <div className="flex-1 w-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={ownerName} 
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-lg"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Avatar Initial</label>
                            <input 
                                type="text" 
                                value={avatarInitial} 
                                onChange={(e) => setAvatarInitial(e.target.value)}
                                maxLength={1}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-center uppercase"
                                placeholder="G"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Site Title</label>
                        <input 
                            type="text" 
                            value={siteTitle} 
                            onChange={(e) => setSiteTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                            placeholder="My Portfolio"
                        />
                    </div>
                
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Avatar Gradient Style</label>
                        <select 
                            value={avatarGradient}
                            onChange={(e) => setAvatarGradient(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 bg-white"
                        >
                            <option value="from-blue-600 to-indigo-600">Blue & Indigo</option>
                            <option value="from-purple-600 to-pink-600">Purple & Pink</option>
                            <option value="from-emerald-500 to-teal-500">Emerald & Teal</option>
                            <option value="from-orange-500 to-red-500">Orange & Red</option>
                            <option value="from-slate-700 to-slate-900">Dark Slate</option>
                        </select>
                         <div className={`mt-2 h-2 w-full rounded-full bg-gradient-to-r ${avatarGradient}`} />
                    </div>
                 </div>
             </div>
         </motion.div>

         {/* Category Manager */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6"
         >
             <h2 className="text-xl font-bold text-slate-900">Category Management</h2>
             <p className="text-sm text-slate-500">Manage the categories available for your posts and projects.</p>
             
             <div className="flex flex-wrap gap-2">
                 {categories.map((cat) => (
                     <div key={cat} className="group flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-slate-700 font-medium">
                         <span>{cat}</span>
                         <button 
                            type="button"
                            onClick={() => setCategories(categories.filter(c => c !== cat))}
                            className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors"
                         >
                             <X className="w-4 h-4" />
                         </button>
                     </div>
                 ))}
                 
                 <div className="flex items-center gap-2">
                     <input 
                        type="text" 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                                    setCategories([...categories, newCategory.trim()]);
                                    setNewCategory("");
                                }
                            }
                        }}
                        className="w-40 px-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm"
                        placeholder="Add new..."
                     />
                     <button
                        type="button" 
                        onClick={() => {
                            if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                                setCategories([...categories, newCategory.trim()]);
                                setNewCategory("");
                            }
                        }}
                        className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                     >
                        <Plus className="w-4 h-4" />
                     </button>
                 </div>
             </div>
         </motion.div>
     </div>
   </div>
   
   {/* Image Cropper Modal */}
   {showCropper && tempImageUrl && (
     <ImageCropper
       imageSrc={tempImageUrl}
       onComplete={handleCropComplete}
       onCancel={() => {
         setShowCropper(false);
         setTempImageUrl(null);
       }}
       aspect={1}
       shape="round"
     />
   )}
  </>
  );
}

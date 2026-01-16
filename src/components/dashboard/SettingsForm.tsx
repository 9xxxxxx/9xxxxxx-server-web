"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Upload, X, Crop as CropIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/canvas";

interface Config {
  id: string;
  ownerName: string;
  avatarInitial: string;
  avatarGradient: string;
  avatarImage?: string | null;
}

const GRADIENTS = [
  { name: "Blue/Indigo", value: "from-blue-600 to-indigo-600" },
  { name: "Purple/Pink", value: "from-purple-600 to-pink-600" },
  { name: "Orange/Red", value: "from-orange-500 to-red-600" },
  { name: "Emerald/Teal", value: "from-emerald-500 to-teal-600" },
];

export function SettingsForm({ initialConfig }: { initialConfig: Config }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ownerName: initialConfig.ownerName,
    avatarInitial: initialConfig.avatarInitial,
    avatarGradient: initialConfig.avatarGradient,
  });
  
  // Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  
  // Final Result State
  const [avatarImage, setAvatarImage] = useState<string | null>(initialConfig.avatarImage || null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
    }
  };

  const performCrop = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (croppedBlob) {
        // Create a File from Blob to send to server
        const file = new File([croppedBlob], "avatar-cropped.jpg", { type: "image/jpeg" });
        setFileToUpload(file);
        setAvatarImage(URL.createObjectURL(croppedBlob));
        setCropImageSrc(null); // Close cropper
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cancelCrop = () => {
    setCropImageSrc(null);
    // Needed to reset input if user wants to select same file again? 
    // Usually simpler to just close.
  };

  const clearImage = () => {
    setAvatarImage(null);
    setFileToUpload(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("ownerName", formData.ownerName);
      data.append("avatarInitial", formData.avatarInitial);
      data.append("avatarGradient", formData.avatarGradient);
      
      if (fileToUpload) {
        data.append("avatarImage", fileToUpload);
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        body: data,
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // If cropping, show overlay
  if (cropImageSrc) {
      return (
          <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4">
              <div className="bg-background w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                  <div className="p-4 border-b flex justify-between items-center bg-card">
                      <h3 className="font-bold text-lg">调整头像位置 (Adjust Image)</h3>
                      <button onClick={cancelCrop} className="p-2 hover:bg-muted rounded-full">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="relative flex-1 bg-black">
                    <Cropper
                        image={cropImageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                  </div>

                  <div className="p-6 bg-card space-y-4">
                      <div className="flex items-center gap-4">
                          <span className="text-sm font-medium min-w-[3rem]">缩放</span>
                          <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                          />
                      </div>
                      <div className="flex gap-3">
                          <button 
                            type="button" 
                            onClick={cancelCrop}
                            className="flex-1 py-2.5 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
                          >
                              取消
                          </button>
                          <button 
                            type="button"
                            onClick={performCrop} 
                            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                          >
                              确认裁剪
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
      {/* Preview */}
      <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-2xl border border-dashed border-border">
          {avatarImage ? (
             <div className="relative group">
                <img 
                  src={avatarImage} 
                  alt="Avatar Preview" 
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white"
                />
                <button 
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
             </div>
          ) : (
            <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg bg-gradient-to-br",
                formData.avatarGradient
              )}>
                {formData.avatarInitial}
              </div>
          )}
          
          <div>
            <h3 className="text-2xl font-bold text-foreground">{formData.ownerName}</h3>
            <p className="text-sm text-muted-foreground">Portfolio Owner</p>
          </div>
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">显示名称 (Name)</label>
        <input
          required
          value={formData.ownerName}
          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">头像图片 (Custom Image)</label>
        <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">点击上传图片 (支持裁剪)</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
        </div>
        <p className="text-xs text-muted-foreground">上传后您可以拖动和缩放图片以获得最佳效果。</p>
      </div>

      {!avatarImage && (
        <>
            <div className="grid gap-4">
                <label className="text-sm font-medium">备用：头像首字母 (Initial)</label>
                <input
                required
                maxLength={1}
                value={formData.avatarInitial}
                onChange={(e) => setFormData({ ...formData, avatarInitial: e.target.value.toUpperCase() })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>

            <div className="grid gap-4">
                <label className="text-sm font-medium">备用：头像风格 (Gradient)</label>
                <div className="grid grid-cols-2 gap-3">
                {GRADIENTS.map((g) => (
                    <button
                    key={g.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarGradient: g.value })}
                    className={cn(
                        "h-12 rounded-lg bg-gradient-to-r relative shadow-sm hover:scale-[1.02] transition-all",
                        g.value,
                        formData.avatarGradient === g.value ? "ring-2 ring-primary ring-offset-2" : ""
                    )}
                    >
                        {formData.avatarGradient === g.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                        )}
                    </button>
                ))}
                </div>
            </div>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "保存更改"}
      </button>
    </form>
  );
}

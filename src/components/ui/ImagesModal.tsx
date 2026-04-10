import { useEffect, useState } from "react";
import { X, Star, Trash2, ImageOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";

interface PropertyImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

interface ImagesModalProps {
  propertyId: string | null;
  propertyTitle: string;
  onClose: () => void;
}

export default function ImagesModal({ propertyId, propertyTitle, onClose }: ImagesModalProps) {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    api
      .get(`/admin/properties/${propertyId}/images`)
      .then((res) => setImages(res.data.data?.images ?? []))
      .catch(() => toast.error("Failed to load images"))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const handleDelete = async (publicId: string) => {
    setDeletingId(publicId);
    try {
      const res = await api.delete(`/admin/properties/${propertyId}/images`, {
        data: { publicId },
      });
      setImages(res.data.data?.images ?? []);
      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (publicId: string) => {
    setSettingPrimaryId(publicId);
    try {
      const res = await api.patch(`/admin/properties/${propertyId}/images/primary`, { publicId });
      setImages(res.data.data?.images ?? []);
      toast.success("Primary image updated");
    } catch {
      toast.error("Failed to update primary");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  if (!propertyId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-modal-in"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div>
            <h3 className="font-semibold text-gray-900 text-[14px]">Property Images</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[380px]">{propertyTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: "#94a3b8" }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#1B3F72" }} />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ImageOff style={{ width: 40, height: 40, color: "#e2e8f0" }} className="mb-3" />
              <p className="text-sm text-gray-400 font-medium">No images uploaded</p>
              <p className="text-xs text-gray-300 mt-1">Images are added when a property is listed</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => {
                const isDeleting = deletingId === img.publicId;
                const isSettingPrimary = settingPrimaryId === img.publicId;

                return (
                  <div
                    key={img.publicId}
                    className="relative rounded-xl overflow-hidden group"
                    style={{ aspectRatio: "4/3", background: "#f8fafc" }}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />

                    {/* Primary badge */}
                    {img.isPrimary && (
                      <div
                        className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: "#C8922A", color: "#fff" }}
                      >
                        <Star style={{ width: 9, height: 9 }} className="fill-white" />
                        Primary
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-150" />

                    {/* Action buttons */}
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {!img.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(img.publicId)}
                          disabled={isSettingPrimary}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-60"
                          style={{ background: "#C8922A", color: "#fff" }}
                          title="Set as primary"
                        >
                          {isSettingPrimary ? (
                            <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" />
                          ) : (
                            <Star style={{ width: 10, height: 10 }} />
                          )}
                          Primary
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(img.publicId)}
                        disabled={isDeleting}
                        className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-60"
                        style={{ background: "rgba(239,68,68,0.9)", color: "#fff" }}
                        title="Delete image"
                      >
                        {isDeleting ? (
                          <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
                        ) : (
                          <Trash2 style={{ width: 12, height: 12 }} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {images.length > 0 && (
          <div
            className="px-5 py-3 shrink-0 flex items-center justify-between"
            style={{ borderTop: "1px solid #f1f5f9" }}
          >
            <p className="text-xs text-gray-400">{images.length} image{images.length !== 1 ? "s" : ""}</p>
            <p className="text-xs text-gray-400">Hover over an image to manage it</p>
          </div>
        )}
      </div>
    </div>
  );
}

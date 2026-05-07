"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type UploadedImage = { id: string; url: string; alt?: string };

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10 MB máximo de entrada
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // mantenerse bajo el límite de Vercel
const MAX_DIMENSION = 1600;

async function downscaleImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(`La imagen pesa más de 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB). Usa una más ligera.`);
  }
  if (file.size <= MAX_UPLOAD_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    let w = Math.round(bitmap.width * scale);
    let h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }

    const qualities = [0.85, 0.75, 0.65, 0.55, 0.45];
    let blob: Blob | null = null;
    for (const q of qualities) {
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(bitmap, 0, 0, w, h);
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", q)
      );
      if (blob && blob.size <= MAX_UPLOAD_BYTES) break;
      // si todavía no entra, reducimos también dimensiones para la siguiente vuelta
      w = Math.round(w * 0.85);
      h = Math.round(h * 0.85);
    }
    bitmap.close?.();
    if (!blob || blob.size > MAX_UPLOAD_BYTES) {
      throw new Error("No se pudo comprimir la imagen lo suficiente. Usa una con menos resolución.");
    }
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch (err) {
    if (err instanceof Error) throw err;
    return file;
  }
}

export function ImageUploader({
  value,
  onChange,
}: {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        const prepared = await downscaleImage(file);
        const fd = new FormData();
        fd.append("file", prepared, prepared.name);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const text = await res.text();
        let data: { url?: string; error?: string } = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          // respuesta no-JSON (HTML de error, body vacío por límite de tamaño, etc.)
        }
        if (!res.ok || !data.url) {
          if (res.status === 413 || res.status === 0 || !text) {
            throw new Error("Imagen demasiado grande. Prueba con una más ligera.");
          }
          throw new Error(data.error || `Error ${res.status} subiendo imagen`);
        }
        uploaded.push({ id: `${Date.now()}-${Math.random()}`, url: data.url, alt: "" });
      }
      onChange([...value, ...uploaded]);
      toast.success(`${uploaded.length} imagen(es) subidas`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setUploading(false);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((i) => i.id === active.id);
    const newIndex = value.findIndex((i) => i.id === over.id);
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  function remove(id: string) {
    onChange(value.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={value.map((v) => v.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {value.map((img, i) => (
              <SortableImage key={img.id} img={img} index={i} onRemove={() => remove(img.id)} />
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent-orange flex flex-col items-center justify-center cursor-pointer text-text-muted hover:text-accent-orange transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="w-7 h-7 mb-1" />
                  <span className="text-xs">Añadir</span>
                </>
              )}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-text-muted">Arrastra para reordenar. La primera imagen será la portada.</p>
    </div>
  );
}

function SortableImage({ img, index, onRemove }: { img: UploadedImage; index: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-bg-tertiary"
    >
      <Image src={img.url} alt={img.alt || ""} fill sizes="200px" className="object-cover" />
      {index === 0 && (
        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-mono uppercase bg-bg-primary/90 text-accent-orange rounded">Portada</span>
      )}
      <button {...attributes} {...listeners} className="absolute top-1.5 right-1.5 p-1 rounded bg-bg-primary/80 cursor-grab opacity-0 group-hover:opacity-100">
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <button onClick={onRemove} className="absolute bottom-1.5 right-1.5 p-1 rounded bg-bg-primary/80 text-accent-red opacity-0 group-hover:opacity-100">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

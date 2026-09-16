"use client";

import { ArrowDownToLine, ArrowUpToLine, Copy, FlipHorizontal2, Trash2, X } from "lucide-react";
import { SPRITE_MAP, spriteUrl } from "@/lib/garden/sprites";
import type { GardenItem } from "@/lib/garden/types";
import { Button } from "@/components/ui";

type Props = {
  item: GardenItem;
  onBeginChange: () => void;
  onChange: (patch: Partial<GardenItem>) => void;
  onFlip: () => void;
  onForward: () => void;
  onBackward: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function ItemInspector({ item, onBeginChange, onChange, onFlip, onForward, onBackward, onDuplicate, onDelete, onClose }: Props) {
  const sprite = SPRITE_MAP[item.kind];
  if (!sprite) return null;

  return (
    <section aria-label={`Edit ${sprite.name}`} className="flex flex-col gap-3 rounded-2xl border border-calm/25 bg-calm/5 p-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={spriteUrl(item.kind)} alt="" className="size-10 object-contain" />
        <span className="min-w-24 text-sm font-medium text-white/90">{sprite.name}</span>
      </div>

      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-xs text-mist/60">
          Size
          <input
            type="range"
            min={0.3}
            max={3}
            step={0.05}
            value={item.scale}
            onPointerDown={onBeginChange}
            onKeyDown={onBeginChange}
            onChange={(e) => onChange({ scale: Number(e.target.value) })}
            className="w-full accent-calm"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-mist/60">
          Rotate
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={item.rotation}
            onPointerDown={onBeginChange}
            onKeyDown={onBeginChange}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="w-full accent-calm"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onFlip} aria-label="Flip">
          <FlipHorizontal2 className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onForward} aria-label="Bring to front">
          <ArrowUpToLine className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onBackward} aria-label="Send to back">
          <ArrowDownToLine className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDuplicate} aria-label="Duplicate">
          <Copy className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Delete" className="hover:text-rose-300">
          <Trash2 className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose} aria-label="Done editing">
          <X className="size-4" />
        </Button>
      </div>
    </section>
  );
}

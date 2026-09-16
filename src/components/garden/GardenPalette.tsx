"use client";

import { useState } from "react";
import { ALL_SPRITES, SPRITE_CATEGORIES, spriteUrl, type SpriteCategory } from "@/lib/garden/sprites";
import { Chip } from "@/components/ui";
import { GARDEN_DRAG_TYPE } from "./GardenStage";

type Props = {
  placingKind: string | null;
  onChoose: (kind: string) => void;
};

export default function GardenPalette({ placingKind, onChoose }: Props) {
  const [category, setCategory] = useState<SpriteCategory>("plants");
  const sprites = ALL_SPRITES.filter((s) => s.category === category);

  return (
    <section aria-labelledby="palette-title" className="rounded-2xl border border-mist/10 bg-night/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 id="palette-title" className="text-sm font-medium text-white/85">
          Add to your garden
        </h3>
        <p className="text-xs text-mist/45">Pick an item, then tap the garden. On a computer you can also drag it in.</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Item categories">
        {SPRITE_CATEGORIES.map((c) => (
          <Chip key={c.id} role="tab" aria-selected={category === c.id} selected={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8" role="tabpanel">
        {sprites.map((sprite) => {
          const active = placingKind === sprite.kind;
          return (
            <li key={sprite.kind}>
              <button
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(GARDEN_DRAG_TYPE, sprite.kind);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => onChoose(sprite.kind)}
                aria-pressed={active}
                className={`flex w-full flex-col items-center gap-1 rounded-xl border p-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-calm/70 ${
                  active ? "border-calm/60 bg-calm/15" : "border-mist/10 bg-[#b9a888]/10 hover:border-mist/30"
                }`}
              >
                <span className="flex h-14 w-full items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={spriteUrl(sprite.kind)} alt="" draggable={false} className="max-h-14 max-w-full" />
                </span>
                <span className="text-[11px] leading-tight text-mist/75">{sprite.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

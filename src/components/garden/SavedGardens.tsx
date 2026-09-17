"use client";

import { useState } from "react";
import { FolderOpen, Save, X } from "lucide-react";
import { createId, useLocalStorage } from "@/hooks/useLocalStorage";
import { renderGardenImage } from "@/lib/garden/export";
import type { Garden } from "@/lib/garden/types";
import { Button, EmptyState, inputClass } from "@/components/ui";

type SavedGarden = { id: string; name: string; savedAt: string; thumbnail: string; garden: Garden };

const NO_SAVED: SavedGarden[] = [];
const MAX_SAVED = 12;

type Props = { garden: Garden; onLoad: (garden: Garden) => void };

export default function SavedGardens({ garden, onLoad }: Props) {
  const [saved, setSaved] = useLocalStorage("dms.garden.gallery", NO_SAVED);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saved.length >= MAX_SAVED) {
      setStatus(`Your gallery holds ${MAX_SAVED} gardens. Delete one to save another.`);
      return;
    }
    setSaving(true);
    try {
      const canvas = await renderGardenImage(garden, 360, { watermark: false });
      const entry: SavedGarden = {
        id: createId(),
        name: name.trim() || `Garden ${saved.length + 1}`,
        savedAt: new Date().toISOString(),
        thumbnail: canvas.toDataURL("image/jpeg", 0.75),
        garden,
      };
      setSaved((prev) => [entry, ...prev]);
      setName("");
      setStatus(`Saved “${entry.name}”.`);
    } catch {
      setStatus("Couldn't save this garden. Your browser storage may be full.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="gallery-title" className="rounded-2xl border border-mist/10 bg-canvas/40 p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="gallery-title" className="text-sm font-medium text-ink/85">
            My gardens
          </h3>
          <p className="text-xs text-mist/45">Your current garden saves automatically. Keep versions you love here — only in this browser.</p>
        </div>
        <form
          className="flex w-full gap-2 sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Name this garden" aria-label="Garden name" className={`${inputClass} py-2 text-sm`} />
          <Button type="submit" size="sm" variant="primary" disabled={saving}>
            <Save className="size-4" /> Save
          </Button>
        </form>
      </div>
      {status && (
        <p role="status" className="mb-3 text-xs text-calm">
          {status}
        </p>
      )}
      {saved.length === 0 ? (
        <EmptyState>No saved gardens yet.</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {saved.map((entry) => (
            <li key={entry.id} className="overflow-hidden rounded-xl border border-mist/10 bg-surface/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.thumbnail} alt={`Thumbnail of ${entry.name}`} className="aspect-[3/2] w-full object-cover" />
              <div className="flex items-center gap-1 p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink/85">{entry.name}</p>
                  <p className="text-[10px] text-mist/40">{new Date(entry.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                </div>
                <Button size="sm" variant="ghost" aria-label={`Open ${entry.name}`} onClick={() => onLoad(entry.garden)}>
                  <FolderOpen className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete ${entry.name}`}
                  onClick={() => {
                    if (window.confirm(`Delete “${entry.name}”?`)) setSaved((prev) => prev.filter((s) => s.id !== entry.id));
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

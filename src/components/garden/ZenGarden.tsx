"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Circle,
  CloudRain,
  Download,
  Eraser,
  Hand,
  Maximize,
  Minimize,
  Moon,
  Music,
  Redo2,
  Share2,
  Snowflake,
  Sparkles,
  Sun,
  Sunset,
  Trash,
  Undo2,
  Volume2,
  VolumeX,
  Waypoints,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { createId } from "@/hooks/useLocalStorage";
import { playSandSweep } from "@/lib/audio";
import { renderGardenImage } from "@/lib/garden/export";
import { MAX_ITEMS, backZ, clamp, frontZ } from "@/lib/garden/layout";
import { createSampleGarden } from "@/lib/garden/presets";
import { createGardenAmbience, playPlaceSound, type GardenAmbience } from "@/lib/garden/sounds";
import { SPRITE_MAP } from "@/lib/garden/sprites";
import { EMPTY_GARDEN, GARDEN_HEIGHT, GARDEN_WIDTH, parseGarden, type Atmosphere, type Garden, type GardenEffect, type GardenItem } from "@/lib/garden/types";
import { readStorage, writeStorage } from "@/lib/storage";
import { Button, Chip } from "@/components/ui";
import GardenPalette from "./GardenPalette";
import GardenStage, { type GardenMode } from "./GardenStage";
import ItemInspector from "./ItemInspector";
import SavedGardens from "./SavedGardens";

const CURRENT_KEY = "dms.garden.current";

const MODES: { id: Exclude<GardenMode, "place">; label: string; icon: LucideIcon }[] = [
  { id: "rake", label: "Rake", icon: Waypoints },
  { id: "stone", label: "Ripple stones", icon: Circle },
  { id: "arrange", label: "Move & edit", icon: Hand },
];

const ATMOSPHERES: { id: Atmosphere; label: string; icon: LucideIcon }[] = [
  { id: "day", label: "Day", icon: Sun },
  { id: "sunset", label: "Sunset", icon: Sunset },
  { id: "night", label: "Night", icon: Moon },
];

const EFFECTS: { id: GardenEffect; label: string; icon?: LucideIcon }[] = [
  { id: "none", label: "Clear" },
  { id: "petals", label: "Petals", icon: Sparkles },
  { id: "rain", label: "Rain", icon: CloudRain },
  { id: "fireflies", label: "Fireflies", icon: Sparkles },
  { id: "snow", label: "Snow", icon: Snowflake },
];

const WATER_KINDS = new Set(["pond", "water-basin", "koi", "lotus", "lily-pads", "duck"]);
const BIRD_KINDS = new Set(["songbird", "crane", "cherry-tree", "maple-tree", "pine-bonsai", "bamboo", "shrub"]);

const subscribeNothing = () => () => {};

/** Loads the autosaved garden only on the client, then hands it to the editor once. */
export default function ZenGarden() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const initial = useMemo(() => {
    if (!hydrated) return EMPTY_GARDEN;
    try {
      const raw = readStorage(CURRENT_KEY);
      return raw ? parseGarden(JSON.parse(raw)) : EMPTY_GARDEN;
    } catch {
      return EMPTY_GARDEN;
    }
  }, [hydrated]);

  return <GardenEditor key={hydrated ? "client" : "server"} initial={initial} />;
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

function GardenEditor({ initial }: { initial: Garden }) {
  const history = useHistory<Garden>(initial);
  const garden = history.value;
  const [mode, setMode] = useState<GardenMode>(initial.items.length ? "arrange" : "rake");
  const [placingKind, setPlacingKind] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sound, setSound] = useState(true);
  const [ambientOn, setAmbientOn] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const ambience = useRef<GardenAmbience | null>(null);

  const selected = garden.items.find((i) => i.id === selectedId) ?? null;

  // Autosave (debounced) to this browser.
  useEffect(() => {
    const id = setTimeout(() => writeStorage(CURRENT_KEY, JSON.stringify(garden)), 400);
    return () => clearTimeout(id);
  }, [garden]);

  // Garden sounds follow what's planted, the time of day and the weather.
  useEffect(() => {
    if (!ambientOn) return;
    const kinds = new Set(garden.items.map((i) => i.kind));
    ambience.current?.setLayers({
      birds: garden.atmosphere !== "night" && [...kinds].some((k) => BIRD_KINDS.has(k)),
      crickets: garden.atmosphere === "night",
      water: [...kinds].some((k) => WATER_KINDS.has(k)),
      chimes: kinds.has("wind-chime"),
      rain: garden.effect === "rain",
    });
  }, [ambientOn, garden.items, garden.atmosphere, garden.effect]);

  useEffect(() => () => ambience.current?.stop(), []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const updateItem = (id: string, patch: Partial<GardenItem>, transient = false) => {
    const update = (g: Garden) => ({ ...g, items: g.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
    if (transient) history.transient(update);
    else history.apply(update);
  };

  const removeItem = (id: string) => {
    history.apply((g) => ({ ...g, items: g.items.filter((i) => i.id !== id) }));
    setSelectedId(null);
  };

  const nudge = (id: string, dx: number, dy: number) => {
    const item = garden.items.find((i) => i.id === id);
    if (item) updateItem(id, { x: clamp(item.x + dx, 0, GARDEN_WIDTH), y: clamp(item.y + dy, 0, GARDEN_HEIGHT) });
  };

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        history.redo();
        return;
      }
      if (e.key === "Escape") {
        setPlacingKind(null);
        setSelectedId(null);
        if (mode === "place") setMode("arrange");
        return;
      }
      if (!selectedId || mode !== "arrange") return;
      const step = e.shiftKey ? 20 : 5;
      const item = garden.items.find((i) => i.id === selectedId);
      if (!item) return;
      switch (e.key) {
        case "Delete":
        case "Backspace":
          e.preventDefault();
          removeItem(selectedId);
          break;
        case "ArrowLeft":
          e.preventDefault();
          nudge(selectedId, -step, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          nudge(selectedId, step, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          nudge(selectedId, 0, -step);
          break;
        case "ArrowDown":
          e.preventDefault();
          nudge(selectedId, 0, step);
          break;
        case "[":
          updateItem(selectedId, { rotation: clamp(item.rotation - 15, -180, 180) });
          break;
        case "]":
          updateItem(selectedId, { rotation: clamp(item.rotation + 15, -180, 180) });
          break;
        case "-":
          updateItem(selectedId, { scale: clamp(item.scale - 0.1, 0.3, 3) });
          break;
        case "=":
        case "+":
          updateItem(selectedId, { scale: clamp(item.scale + 0.1, 0.3, 3) });
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function addItem(kind: string, x: number, y: number) {
    const sprite = SPRITE_MAP[kind];
    if (!sprite) return;
    if (garden.items.length >= MAX_ITEMS) {
      setNotice(`Your garden has ${MAX_ITEMS} items — that's the limit. Remove something to add more.`);
      return;
    }
    const item: GardenItem = { id: createId(), kind, x, y, scale: 1, rotation: 0, flip: false, z: frontZ(garden.items, sprite.layer) };
    history.apply((g) => ({ ...g, items: [...g.items, item] }));
    setSelectedId(item.id);
    if (sound) playPlaceSound(sprite.sound);
  }

  function chooseItem(kind: string) {
    if (placingKind === kind && mode === "place") {
      setPlacingKind(null);
      setMode("arrange");
      return;
    }
    setPlacingKind(kind);
    setMode("place");
    setNotice(null);
  }

  function selectMode(next: GardenMode) {
    setMode(next);
    setPlacingKind(null);
    if (next !== "arrange") setSelectedId(null);
  }

  function smoothSand() {
    if (!garden.strokes.length && !garden.stones.length) return;
    history.apply((g) => ({ ...g, strokes: [], stones: [] }));
    if (sound) playSandSweep();
  }

  function clearGarden() {
    if (!window.confirm("Clear the whole garden? You can undo this.")) return;
    history.apply((g) => ({ ...EMPTY_GARDEN, seed: g.seed }));
    setSelectedId(null);
    if (sound) playSandSweep();
  }

  function loadSample() {
    history.load(createSampleGarden(createId));
    setSelectedId(null);
    setMode("arrange");
  }

  async function exportImage(share: boolean) {
    setNotice("Preparing your image…");
    const canvas = await renderGardenImage(garden, 2400);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) {
      setNotice("Couldn't create the image.");
      return;
    }
    const file = new File([blob], "my-zen-garden.png", { type: "image/png" });
    if (share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "My zen garden", text: "A calm little garden I made on DropMyStress." });
        setNotice(null);
      } catch {
        setNotice(null);
      }
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setNotice("Image downloaded.");
  }

  function toggleAmbience() {
    if (ambientOn) {
      ambience.current?.stop();
      ambience.current = null;
      setAmbientOn(false);
    } else {
      ambience.current = createGardenAmbience();
      setAmbientOn(true);
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen?.();
  }

  // Server render can't know about the Web Share API, so decide only on the client.
  const canShare = useSyncExternalStore(subscribeNothing, () => "share" in navigator, () => false);

  return (
    <div ref={rootRef} className="flex flex-col gap-4 [&:fullscreen]:overflow-y-auto [&:fullscreen]:bg-night [&:fullscreen]:p-4 sm:[&:fullscreen]:p-8">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Garden tool">
          {MODES.map((m) => (
            <Chip key={m.id} selected={mode === m.id} onClick={() => selectMode(m.id)}>
              <m.icon className="mr-1.5 inline size-4" /> {m.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button size="sm" variant="ghost" onClick={history.undo} disabled={!history.canUndo} aria-label="Undo" title="Undo (Ctrl/⌘ Z)">
            <Undo2 className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={history.redo} disabled={!history.canRedo} aria-label="Redo" title="Redo (Ctrl/⌘ Shift Z)">
            <Redo2 className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSound(!sound)} aria-pressed={sound} title="Sound effects">
            {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            <span className="hidden sm:inline">Effects</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleAmbience} aria-pressed={ambientOn} title="Garden sounds" className={ambientOn ? "text-calm" : ""}>
            <Music className="size-4" />
            <span className="hidden sm:inline">Garden sounds</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen"}>
            {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          </Button>
        </div>
      </div>

      {mode === "place" && placingKind && (
        <p className="rounded-xl bg-calm/10 px-3 py-2 text-sm text-calm" role="status">
          Tap the garden to add a {SPRITE_MAP[placingKind]?.name.toLowerCase()}. Tap as many times as you like — press Esc or choose “Move &amp; edit” when you&apos;re done.
        </p>
      )}
      {mode === "arrange" && !garden.items.length && (
        <p className="rounded-xl bg-mist/5 px-3 py-2 text-sm text-mist/60">Your garden is empty. Pick something below to add it, or start from a sample garden.</p>
      )}

      <GardenStage
        garden={garden}
        mode={mode}
        placingKind={placingKind}
        selectedId={selectedId}
        sound={sound}
        onSelect={setSelectedId}
        onAddStroke={(points) => history.apply((g) => ({ ...g, strokes: [...g.strokes, { id: createId(), points }] }))}
        onAddStone={(stone) => history.apply((g) => ({ ...g, stones: [...g.stones, { id: createId(), ...stone }] }))}
        onPlace={addItem}
        onBeginMove={history.checkpoint}
        onMoveItem={(id, x, y) => updateItem(id, { x, y }, true)}
      />

      {selected && mode === "arrange" && (
        <ItemInspector
          item={selected}
          onBeginChange={history.checkpoint}
          onChange={(patch) => updateItem(selected.id, patch, true)}
          onFlip={() => updateItem(selected.id, { flip: !selected.flip })}
          onForward={() => updateItem(selected.id, { z: frontZ(garden.items.filter((i) => i.id !== selected.id), SPRITE_MAP[selected.kind].layer) })}
          onBackward={() => updateItem(selected.id, { z: backZ(garden.items.filter((i) => i.id !== selected.id), SPRITE_MAP[selected.kind].layer) })}
          onDuplicate={() => addItem(selected.kind, clamp(selected.x + 30, 0, GARDEN_WIDTH), clamp(selected.y + 20, 0, GARDEN_HEIGHT))}
          onDelete={() => removeItem(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      )}

      {notice && (
        <p className="text-sm text-mist/70" role="status">
          {notice}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Time of day">
          {ATMOSPHERES.map((a) => (
            <Chip key={a.id} selected={garden.atmosphere === a.id} onClick={() => history.apply((g) => ({ ...g, atmosphere: a.id }))}>
              <a.icon className="mr-1.5 inline size-4" /> {a.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Weather">
          {EFFECTS.map((w) => (
            <Chip key={w.id} selected={garden.effect === w.id} onClick={() => history.apply((g) => ({ ...g, effect: w.id }))}>
              {w.icon && <w.icon className="mr-1.5 inline size-4" />} {w.label}
            </Chip>
          ))}
        </div>
      </div>

      <GardenPalette placingKind={mode === "place" ? placingKind : null} onChoose={chooseItem} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <Button size="sm" onClick={loadSample}>
            <WandSparkles className="size-4" /> Sample garden
          </Button>
          <Button size="sm" variant="ghost" onClick={smoothSand} disabled={!garden.strokes.length && !garden.stones.length}>
            <Eraser className="size-4" /> Smooth the sand
          </Button>
          <Button size="sm" variant="ghost" onClick={clearGarden}>
            <Trash className="size-4" /> Clear all
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {canShare && (
            <Button size="sm" variant="ghost" onClick={() => void exportImage(true)}>
              <Share2 className="size-4" /> Share
            </Button>
          )}
          <Button size="sm" variant="primary" onClick={() => void exportImage(false)}>
            <Download className="size-4" /> Download image
          </Button>
        </div>
      </div>

      <SavedGardens
        garden={garden}
        onLoad={(g) => {
          history.load(parseGarden(g));
          setSelectedId(null);
          setMode("arrange");
        }}
      />

      <p className="text-center text-xs text-mist/40">
        Shortcuts: Ctrl/⌘ Z undo · arrows move · [ ] rotate · − + resize · Delete removes · Esc stops placing
      </p>
    </div>
  );
}

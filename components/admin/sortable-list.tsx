"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

// Reorders by dragging the grip, or with the arrow buttons (keyboard and single-pointer
// alternative, WCAG 2.5.7). The parent owns `items` and saves the new order.
export function SortableList<T extends { id: string }>({
  items,
  onChange,
  label,
  children,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  label: (item: T) => string;
  children: (item: T, index: number) => React.ReactNode;
}) {
  const dragFrom = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
    setAnnouncement(`Đã chuyển ${label(item)} tới vị trí ${to + 1} trên ${items.length}.`);
  };

  return (
    <>
      <ol className="divide-y rounded-xl border bg-card">
        {items.map((item, i) => (
          <li
            key={item.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(i);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom.current !== null) move(dragFrom.current, i);
              dragFrom.current = null;
              setOver(null);
            }}
            className={`flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4 ${over === i ? "bg-secondary" : ""}`}
          >
            <span
              draggable
              onDragStart={(e) => {
                dragFrom.current = i;
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", item.id); // Firefox only starts a drag with data set
                e.dataTransfer.setDragImage(e.currentTarget.closest("li")!, 16, 16);
              }}
              onDragEnd={() => setOver(null)}
              title="Kéo để sắp xếp"
              className="cursor-grab text-muted-foreground active:cursor-grabbing"
            >
              <GripVertical aria-hidden className="size-5" />
            </span>
            {children(item, i)}
            <span className="flex gap-1">
              <Button type="button" variant="outline" size="icon" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Đưa ${label(item)} lên`}>
                <ArrowUp />
              </Button>
              <Button type="button" variant="outline" size="icon" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} aria-label={`Đưa ${label(item)} xuống`}>
                <ArrowDown />
              </Button>
            </span>
          </li>
        ))}
      </ol>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

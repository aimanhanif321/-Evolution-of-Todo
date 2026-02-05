"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tag } from "@/types/task";
import { Plus, ChevronDown } from "lucide-react";
import TagBadge from "./TagBadge";

interface TagInputProps {
  availableTags: Tag[];
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
  onCreateTag?: (name: string) => Promise<Tag | null>;
  className?: string;
}

const DEFAULT_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6B7280", // gray
];

export default function TagInput({
  availableTags,
  selectedTagIds,
  onChange,
  onCreateTag,
  className = "",
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTags = availableTags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  const filteredTags = availableTags.filter(
    (tag) =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateNew =
    searchTerm.trim() &&
    !availableTags.some(
      (tag) => tag.name.toLowerCase() === searchTerm.trim().toLowerCase()
    );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTag = (tagId: number) => {
    onChange([...selectedTagIds, tagId]);
    setSearchTerm("");
  };

  const handleRemoveTag = (tagId: number) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!onCreateTag || !searchTerm.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const randomColor =
        DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
      const newTag = await onCreateTag(searchTerm.trim());
      if (newTag) {
        onChange([...selectedTagIds, newTag.id]);
        setSearchTerm("");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="text-sm font-medium text-slate-700 block mb-2">
        Tags
      </label>

      {/* Selected tags display */}
      <div
        className="min-h-[42px] w-full px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer flex flex-wrap gap-2 items-center"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            size="sm"
            onRemove={() => handleRemoveTag(tag.id)}
          />
        ))}
        {selectedTags.length === 0 && (
          <span className="text-slate-400 text-sm">Select tags...</span>
        )}
        <ChevronDown
          size={16}
          className="ml-auto text-slate-400 flex-shrink-0"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search or create tag..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreateNew && onCreateTag) {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
            />
          </div>

          {/* Available tags */}
          <div className="py-1">
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleAddTag(tag.id)}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm text-slate-700">{tag.name}</span>
              </button>
            ))}

            {filteredTags.length === 0 && !canCreateNew && (
              <div className="px-3 py-2 text-sm text-slate-400">
                {searchTerm ? "No matching tags" : "No more tags available"}
              </div>
            )}

            {/* Create new tag option */}
            {canCreateNew && onCreateTag && (
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={isCreating}
                className="w-full px-3 py-2 text-left hover:bg-indigo-50 flex items-center gap-2 border-t border-slate-100"
              >
                <Plus size={16} className="text-indigo-600" />
                <span className="text-sm text-indigo-600">
                  {isCreating ? "Creating..." : `Create "${searchTerm.trim()}"`}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

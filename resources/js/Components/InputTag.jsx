import { useState } from "react";
import { XIcon, GripVertical } from "lucide-react";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
    useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function TagItem({ id, text, onRemove, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(text);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // SAVE EDIT
    const saveEdit = () => {
        const newVal = editValue.trim();

        if (newVal && newVal !== text) {
            onEdit(text, newVal);
        }

        setIsEditing(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 bg-neutral text-white px-3 text-xs rounded-full"
        >
            {/* DRAG HANDLE */}
            {!isEditing && (
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
            )}

            {/* EDIT MODE */}
            {isEditing ? (
                <input
                    autoFocus
                    value={editValue}
                    className="bg-neutral text-white outline-none w-24"
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setIsEditing(false);
                    }}
                />
            ) : (
                <span
                    onDoubleClick={() => setIsEditing(true)}
                    className="cursor-pointer"
                >
                    {text}
                </span>
            )}

            {/* DELETE */}
            <button
                type="button"
                onClick={() => onRemove(text)}
                className="hover:bg-error rounded-full p-1"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function InputTag({ label = "Tags", value = [], onChange }) {
    const [tagInput, setTagInput] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    // REORDER
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = value.indexOf(active.id);
            const newIndex = value.indexOf(over.id);

            onChange(arrayMove(value, oldIndex, newIndex));
        }
    };

    // INPUT CHANGE (ADD WHEN COMMA)
    const handleTagInputChange = (e) => {
        const val = e.target.value;

        if (val.endsWith(",")) {
            const newTag = val.slice(0, -1).trim();

            if (newTag && !value.includes(newTag)) {
                onChange([...value, newTag]);
            }
            setTagInput("");
        } else {
            setTagInput(val);
        }
    };

    // ENTER & DELETE KEY
    const handleTagKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const newTag = tagInput.trim();

            if (newTag && !value.includes(newTag)) {
                onChange([...value, newTag]);
            }

            setTagInput("");
        }

        if (e.key === "Backspace" && tagInput === "" && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    // DELETE TAG
    const removeTag = (tag) => {
        onChange(value.filter((t) => t !== tag));
    };

    // EDIT TAG
    const editTag = (oldTag, newTag) => {
        if (value.includes(newTag)) return;

        const updated = value.map((t) => (t === oldTag ? newTag : t));
        onChange(updated);
    };

    return (
        <div className="space-y-2 w-full">
            <label className="label mb-2">
                <span className="label-text font-bold">{label}</span>
            </label>

            <div className="flex flex-wrap gap-2 rounded-box border border-[#d1d1d1] p-2 w-full">

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={value}
                        strategy={verticalListSortingStrategy}
                    >
                        {value.map((tag) => (
                            <TagItem
                                key={tag}
                                id={tag}
                                text={tag}
                                onRemove={removeTag}
                                onEdit={editTag}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                <input
                    type="text"
                    className="input input-sm border-transparent focus:outline-none 
                        flex-1 min-w-[150px] bg-transparent shadow-none"
                    placeholder={value.length === 0 ? "Tulis tag lalu koma…" : ""}
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                />
            </div>
        </div>
    );
}

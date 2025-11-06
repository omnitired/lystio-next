import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import categoriesData from "@/data/categories.json";
import { mockCounts } from "@/data/mockCounts";
import { Checkbox } from "./ui/Checkbox";
import {
  categoryIcons,
  PURPLE_FILTER,
  SLIDE_DURATION,
} from "@/lib/categoryUtils";

interface CategorySelectorProps {
  onCategoryUpdate?: (
    categoryName: string,
    typeId: string,
    subtypeIds: string[],
  ) => void;
  initialTypeId?: string;
  initialSubtypeIds?: string[];
  variant?: "dropdown" | "modal";
}

interface AllSubcategoriesButtonProps {
  onClick: () => void;
  checked: boolean;
  totalCount: number;
  variant: "dropdown" | "modal";
}

interface SubcategoryItemProps {
  subtypeId: string;
  subtypeName: string;
  checked: boolean;
  onClick: () => void;
  variant: "dropdown" | "modal";
}

interface SectionHeaderProps {
  title: string;
}

interface CategoryButtonProps {
  typeId: string;
  typeName: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
  variant: "dropdown" | "modal";
}

interface SubcategoryListProps {
  subtypes: Record<string, string>;
  selectedSubtypes: Set<string>;
  allSubcategoriesSelected: boolean;
  onToggleSubtype: (id: string) => void;
  onToggleAllSubcategories: () => void;
  totalCount: number;
  variant: "dropdown" | "modal";
  typeId?: string;
}

function AllSubcategoriesButton({
  onClick,
  checked,
  totalCount,
  variant,
}: AllSubcategoriesButtonProps) {
  const isModal = variant === "modal";

  return (
    <button
      onClick={onClick}
      className={`${isModal ? "w-full" : ""} flex items-center ${
        isModal ? "gap-3 px-4 py-3" : "gap-2 px-3 py-2 h-10"
      } ${isModal ? "border-t" : "border-b"} border-border-light ${isModal ? "hover-purple" : ""}`}
    >
      <Checkbox checked={checked} />
      <span
        className={`${
          isModal ? "text-body" : "text-body-sm leading-[1.6] whitespace-nowrap"
        } flex-1 text-left`}
      >
        All Subcategories
      </span>
      <span
        className={
          isModal
            ? "text-caption"
            : "text-[10px] font-semibold text-text-secondary leading-[1.2] text-right whitespace-nowrap"
        }
      >
        {totalCount.toLocaleString()}
      </span>
    </button>
  );
}

function SubcategoryItem({
  subtypeId,
  subtypeName,
  checked,
  onClick,
  variant,
}: SubcategoryItemProps) {
  const isModal = variant === "modal";

  return (
    <button
      key={subtypeId}
      onClick={onClick}
      className={`${isModal ? "w-full" : ""} flex items-center ${
        isModal ? "gap-3 px-4 py-3" : "gap-2 px-3 py-2 h-10"
      } hover-purple`}
    >
      <Checkbox checked={checked} />
      <span
        className={`${
          isModal ? "text-body" : "text-body-sm leading-[1.6] whitespace-nowrap"
        } flex-1 text-left`}
      >
        {subtypeName}
      </span>
      <span
        className={
          isModal
            ? "text-caption"
            : "text-[10px] font-semibold text-text-secondary leading-[1.2] text-right whitespace-nowrap"
        }
      >
        {Math.floor(Math.random() * 1000)}
      </span>
    </button>
  );
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <p className="text-base font-semibold text-text-primary leading-normal">
        {title}
      </p>
    </div>
  );
}

function CategoryButton({
  typeId,
  typeName,
  isActive,
  count,
  onClick,
  variant,
}: CategoryButtonProps) {
  const isModal = variant === "modal";

  if (isModal) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 ${
          isActive ? "bg-bg-light" : "hover-purple-subtle"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Image
            src={categoryIcons[typeId]}
            alt={typeName}
            width={20}
            height={20}
            className="shrink-0"
            style={{ filter: isActive ? PURPLE_FILTER : "none" }}
          />
          <span
            className={`text-base font-medium ${
              isActive ? "text-brand-purple" : "text-text-primary"
            }`}
          >
            {typeName}
          </span>
          <span
            className={`text-xs font-semibold ${
              isActive ? "text-brand-purple" : "text-text-secondary"
            }`}
          >
            {count.toLocaleString()}
          </span>
        </div>
        {isActive ? (
          <ChevronUpIcon className="w-5 h-5 text-brand-purple" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-[#79767D]" />
        )}
      </button>
    );
  }

  // Dropdown variant
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 h-10 ${
        isActive ? "bg-bg-light" : "hover-purple-subtle"
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Image
          src={categoryIcons[typeId]}
          alt={typeName}
          width={16}
          height={16}
          className="shrink-0"
          style={{ filter: isActive ? PURPLE_FILTER : "none" }}
        />
        <span
          className={`text-sm font-medium leading-[1.6] whitespace-nowrap ${
            isActive ? "text-brand-purple" : "text-text-primary"
          }`}
        >
          {typeName}
        </span>
        <span
          className={`text-[10px] font-semibold leading-[1.2] whitespace-nowrap ${
            isActive ? "text-brand-purple" : "text-text-secondary"
          }`}
        >
          {count.toLocaleString()}
        </span>
        <div className="shrink-0">
          <ChevronRightIcon
            className={`w-5 h-5 ${isActive ? "text-brand-purple" : "text-[#79767D]"}`}
          />
        </div>
      </div>
    </button>
  );
}

function SubcategoryList({
  subtypes,
  selectedSubtypes,
  allSubcategoriesSelected,
  onToggleSubtype,
  onToggleAllSubcategories,
  totalCount,
  variant,
  typeId,
}: SubcategoryListProps) {
  return (
    <>
      <AllSubcategoriesButton
        onClick={onToggleAllSubcategories}
        checked={allSubcategoriesSelected}
        totalCount={totalCount}
        variant={variant}
      />
      {Object.entries(subtypes).map(([subtypeId, subtypeName]) => (
        <SubcategoryItem
          key={subtypeId}
          subtypeId={subtypeId}
          subtypeName={subtypeName}
          checked={!allSubcategoriesSelected && selectedSubtypes.has(subtypeId)}
          onClick={() => onToggleSubtype(subtypeId)}
          variant={variant}
        />
      ))}
    </>
  );
}

export function CategorySelector({
  onCategoryUpdate,
  initialTypeId,
  initialSubtypeIds,
  variant = "dropdown",
}: CategorySelectorProps) {
  const [expandedType, setExpandedType] = useState<string | null>(
    variant === "modal" ? initialTypeId || null : null,
  );
  const [selectedType, setSelectedType] = useState<string>(
    initialTypeId || "3",
  );
  const [selectedSubtypes, setSelectedSubtypes] = useState<Set<string>>(
    initialSubtypeIds && initialSubtypeIds.length > 0
      ? new Set(initialSubtypeIds)
      : new Set(),
  );
  const [allSubcategoriesSelected, setAllSubcategoriesSelected] = useState(
    !initialSubtypeIds || initialSubtypeIds.length === 0,
  );

  const isModal = variant === "modal";

  const notifyParent = (
    typeId: string,
    subtypes: Set<string>,
    allSelected: boolean,
  ) => {
    const typeName =
      categoriesData.types[typeId as keyof typeof categoriesData.types];
    const subtypeIds = allSelected ? [] : Array.from(subtypes);
    onCategoryUpdate?.(typeName, typeId, subtypeIds);
  };

  const toggleCategory = (typeId: string) => {
    if (isModal) {
      if (expandedType === typeId) {
        setExpandedType(null);
      } else {
        setExpandedType(typeId);
        setSelectedType(typeId);
        setSelectedSubtypes(new Set());
        setAllSubcategoriesSelected(true);
        notifyParent(typeId, new Set(), true);
      }
    } else {
      setSelectedType(typeId);
      setSelectedSubtypes(new Set());
      setAllSubcategoriesSelected(true);
      notifyParent(typeId, new Set(), true);
    }
  };

  const toggleSubtype = (subtypeId: string) => {
    const newSelected = new Set(selectedSubtypes);
    if (newSelected.has(subtypeId)) {
      newSelected.delete(subtypeId);
    } else {
      newSelected.add(subtypeId);
    }
    setSelectedSubtypes(newSelected);
    setAllSubcategoriesSelected(false);
    notifyParent(selectedType, newSelected, false);
  };

  const toggleAllSubcategories = () => {
    const newAllSelected = !allSubcategoriesSelected;
    setAllSubcategoriesSelected(newAllSelected);
    setSelectedSubtypes(new Set());
    notifyParent(selectedType, new Set(), newAllSelected);
  };

  const currentSubtypes =
    categoriesData.subtypes[
      selectedType as keyof typeof categoriesData.subtypes
    ] || {};

  if (isModal) {
    return (
      <div className="flex-1 overflow-y-auto">
        {Object.entries(categoriesData.types).map(([typeId, typeName]) => {
          const isExpanded = expandedType === typeId;
          const currentSubtypes =
            categoriesData.subtypes[
              typeId as keyof typeof categoriesData.subtypes
            ] || {};

          return (
            <div key={typeId} className="border-b border-border-light">
              <CategoryButton
                typeId={typeId}
                typeName={typeName}
                isActive={isExpanded}
                count={mockCounts[typeId] || 0}
                onClick={() => toggleCategory(typeId)}
                variant="modal"
              />
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: SLIDE_DURATION }}
                    className="bg-white overflow-hidden"
                  >
                    <SubcategoryList
                      subtypes={currentSubtypes}
                      selectedSubtypes={selectedSubtypes}
                      allSubcategoriesSelected={allSubcategoriesSelected}
                      onToggleSubtype={toggleSubtype}
                      onToggleAllSubcategories={toggleAllSubcategories}
                      totalCount={mockCounts[typeId] || 0}
                      variant="modal"
                      typeId={typeId}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className="flex">
      {/* Left Panel - Categories */}
      <div className="flex-1 flex flex-col">
        <SectionHeader title="Category" />
        <div className="flex-1 flex flex-col overflow-auto max-h-[480px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {Object.entries(categoriesData.types).map(([typeId, typeName]) => (
            <CategoryButton
              key={typeId}
              typeId={typeId}
              typeName={typeName}
              isActive={selectedType === typeId}
              count={mockCounts[typeId] || 0}
              onClick={() => toggleCategory(typeId)}
              variant="dropdown"
            />
          ))}
        </div>
      </div>

      {/* Right Panel - Subcategories */}
      <div className="flex-1 border-l border-border-light flex flex-col">
        <motion.div
          key={selectedType}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: SLIDE_DURATION }}
          className="flex flex-col h-full"
        >
          <SectionHeader
            title={
              categoriesData.types[
                selectedType as keyof typeof categoriesData.types
              ]
            }
          />
          <div className="flex-1 flex flex-col overflow-auto max-h-[480px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <SubcategoryList
              subtypes={currentSubtypes}
              selectedSubtypes={selectedSubtypes}
              allSubcategoriesSelected={allSubcategoriesSelected}
              onToggleSubtype={toggleSubtype}
              onToggleAllSubcategories={toggleAllSubcategories}
              totalCount={mockCounts[selectedType] || 0}
              variant="dropdown"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { Modal } from "./ui/Modal";
import { CategorySelector } from "./CategorySelector";
import { useFilter } from "@/contexts/FilterContext";
import categoriesData from "@/data/categories.json";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
}: CategoryModalProps) {
  const { filter, updateCategory } = useFilter();

  const defaultTypeId = filter.typeId || "3";
  const defaultTypeName = categoriesData.types[defaultTypeId as keyof typeof categoriesData.types] || "Houses";
  const defaultSubtypes = categoriesData.subtypes[defaultTypeId as keyof typeof categoriesData.subtypes] || {};
  const defaultSubtypeIds = filter.subTypeIds.length > 0 ? filter.subTypeIds : Object.keys(defaultSubtypes);

  const categoryRef = useRef<{ categoryName: string; typeId: string; subtypeIds: string[] }>({
    categoryName: defaultTypeName,
    typeId: defaultTypeId,
    subtypeIds: defaultSubtypeIds
  });

  const handleCategoryUpdate = (categoryName: string, typeId: string, subtypeIds: string[]) => {
    categoryRef.current = { categoryName, typeId, subtypeIds };
  };

  const handleApply = () => {
    updateCategory(categoryRef.current.categoryName, categoryRef.current.typeId, categoryRef.current.subtypeIds);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
      title="Category"
    >
      <CategorySelector
        onCategoryUpdate={handleCategoryUpdate}
        initialTypeId={filter.typeId}
        initialSubtypeIds={filter.subTypeIds}
        variant="modal"
      />
    </Modal>
  );
}

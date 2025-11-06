"use client";

import { useState } from "react";
import { Modal } from "./ui/Modal";
import { CategorySelector } from "./CategorySelector";
import { useFilter } from "@/contexts/FilterContext";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const { filter, updateCategory } = useFilter();
  const { typeId, subTypeIds } = filter;

  const [tempCategoryName, setTempCategoryName] = useState(filter.category);
  const [tempTypeId, setTempTypeId] = useState(typeId);
  const [tempSubtypeIds, setTempSubtypeIds] = useState(subTypeIds);

  const handleCategoryUpdate = (
    categoryName: string,
    typeId: string,
    subtypeIds: string[],
  ) => {
    setTempCategoryName(categoryName);
    setTempTypeId(typeId);
    setTempSubtypeIds(subtypeIds);
  };

  const handleApply = () => {
    updateCategory(tempCategoryName, tempTypeId, tempSubtypeIds);
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
        initialTypeId={typeId}
        initialSubtypeIds={subTypeIds}
        variant="modal"
      />
    </Modal>
  );
}

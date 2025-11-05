import { useRef } from "react";
import { Modal } from "./Modal";
import { CategorySelector } from "./CategorySelector";
import categoriesData from "../categories.json";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryUpdate?: (categoryName: string, typeId: string, subtypeIds: string[]) => void;
  initialTypeId?: string;
  initialSubtypeIds?: string[];
}

export function CategoryModal({
  isOpen,
  onClose,
  onCategoryUpdate,
  initialTypeId,
  initialSubtypeIds
}: CategoryModalProps) {
  const defaultTypeId = initialTypeId || "3";
  const defaultTypeName = categoriesData.types[defaultTypeId as keyof typeof categoriesData.types] || "Houses";
  const defaultSubtypes = categoriesData.subtypes[defaultTypeId as keyof typeof categoriesData.subtypes] || {};
  const defaultSubtypeIds = initialSubtypeIds || Object.keys(defaultSubtypes);

  const categoryRef = useRef<{ categoryName: string; typeId: string; subtypeIds: string[] }>({
    categoryName: defaultTypeName,
    typeId: defaultTypeId,
    subtypeIds: defaultSubtypeIds
  });

  const handleCategoryUpdate = (categoryName: string, typeId: string, subtypeIds: string[]) => {
    categoryRef.current = { categoryName, typeId, subtypeIds };
  };

  const handleApply = () => {
    onCategoryUpdate?.(categoryRef.current.categoryName, categoryRef.current.typeId, categoryRef.current.subtypeIds);
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
        initialTypeId={initialTypeId}
        initialSubtypeIds={initialSubtypeIds}
        variant="modal"
      />
    </Modal>
  );
}

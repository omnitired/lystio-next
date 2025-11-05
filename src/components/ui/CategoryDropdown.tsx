import { Dropdown } from "./Dropdown";
import { CategorySelector } from "./CategorySelector";

interface CategoryDropdownProps {
  onClose?: () => void;
  onApply?: (selectedTypes: string[], selectedSubtypes: string[]) => void;
  onCategoryUpdate?: (categoryName: string, typeId: string, subtypeIds: string[]) => void;
  isOpen?: boolean;
  initialTypeId?: string;
  initialSubtypeIds?: string[];
}

export function CategoryDropdown({ onClose, onCategoryUpdate, isOpen = true, initialTypeId, initialSubtypeIds }: CategoryDropdownProps) {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose} className="flex">
      <CategorySelector
        onCategoryUpdate={onCategoryUpdate}
        initialTypeId={initialTypeId}
        initialSubtypeIds={initialSubtypeIds}
        variant="dropdown"
      />
    </Dropdown>
  );
}

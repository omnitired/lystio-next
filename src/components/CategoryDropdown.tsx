import { Dropdown } from "./ui/Dropdown";
import { CategorySelector } from "./CategorySelector";

interface CategoryDropdownProps {
  onClose?: () => void;
  onCategoryUpdate?: (categoryName: string, typeId: string, subtypeIds: string[]) => void;
  isOpen?: boolean;
  initialTypeId?: string;
  initialSubtypeIds?: string[];
}

export function CategoryDropdown({ onClose, isOpen = true, ...selectorProps }: CategoryDropdownProps) {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose} className="flex">
      <CategorySelector {...selectorProps} variant="dropdown" />
    </Dropdown>
  );
}

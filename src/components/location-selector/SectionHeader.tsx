interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <p className="text-base font-semibold text-text-primary leading-normal">
        {title}
      </p>
    </div>
  );
}

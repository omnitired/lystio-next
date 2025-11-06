import Image from "next/image";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "icon";
  fullWidth?: boolean;
  icon?: string;
  iconWidth?: number;
  iconHeight?: number;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}

/**
 * Reusable button component with consistent styling
 *
 * Variants:
 * - primary: Purple background CTA button
 * - secondary: White background with border
 * - icon: Icon-only button
 */
export function Button({
  variant = "primary",
  fullWidth = false,
  icon,
  iconWidth = 20,
  iconHeight = 20,
  iconPosition = "left",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-brand-purple hover:bg-brand-purple-alt text-white rounded-full font-medium",
    secondary:
      "bg-white border border-border-light rounded-lg hover:bg-bg-light",
    icon: "p-2 hover:bg-bg-light rounded-full",
  };

  const sizeStyles = {
    primary: children ? "py-4 px-6" : "py-3 px-4",
    secondary: "h-10 px-4",
    icon: "",
  };

  const textStyles = {
    primary: "text-base",
    secondary: "text-base font-medium text-text-primary",
    icon: "",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const combinedClassName =
    `${baseStyles} ${variantStyles[variant]} ${sizeStyles[variant]} ${textStyles[variant]} ${widthClass} ${className}`.trim();

  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {icon && iconPosition === "left" && (
        <Image src={icon} alt="" width={iconWidth} height={iconHeight} />
      )}
      {children}
      {icon && iconPosition === "right" && (
        <Image src={icon} alt="" width={iconWidth} height={iconHeight} />
      )}
    </button>
  );
}

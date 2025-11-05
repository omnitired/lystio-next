"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  title: string;
  children: React.ReactNode;
  applyDisabled?: boolean;
  applyText?: string;
  applyIcon?: string;
  showFooter?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onApply,
  title,
  children,
  applyDisabled = false,
  applyText = "Apply",
  applyIcon,
  showFooter = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";

      // Animate modal entrance
      if (modalRef.current && overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );

        gsap.fromTo(
          modalRef.current,
          {
            y: "100%",
            opacity: 0,
          },
          {
            y: "0%",
            opacity: 1,
            duration: 0.4,
            ease: "power3.out",
          }
        );
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current && overlayRef.current) {
      // Animate modal exit
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });

      gsap.to(modalRef.current, {
        y: "100%",
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => {
          onClose();
        },
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 z-109"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 bg-white z-110 flex flex-col"
        style={{ opacity: 0, transform: "translateY(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-bg-light rounded-full transition-colors"
          >
            <Image src="/icons/close.svg" alt="Close" width={24} height={24} />
          </button>
        </div>

        {/* Content */}
        {children}

        {/* Footer */}
        {showFooter && (
          <div className="p-4 border-t border-border-light">
            <button
              onClick={onApply}
              disabled={applyDisabled}
              className="w-full bg-brand-purple hover:bg-brand-purple-alt transition-colors rounded-full py-4 text-base font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {applyIcon && (
                <Image src={applyIcon} alt="" width={20} height={20} />
              )}
              {applyText}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "./Button";

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


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 bg-black/40 z-109"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className="fixed inset-0 bg-white z-110 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              <Button
                variant="icon"
                onClick={onClose}
                icon="/icons/close.svg"
                iconWidth={24}
                iconHeight={24}
              />
            </div>

            {/* Content */}
            {children}

            {/* Footer */}
            {showFooter && (
              <div className="p-4 border-t border-border-light">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={onApply}
                  disabled={applyDisabled}
                  icon={applyIcon}
                  iconWidth={20}
                  iconHeight={20}
                >
                  {applyText}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

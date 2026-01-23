"use client";
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  };

  // Touch handlers for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLElement>) => {
    setIsHovering(true);
    const touch = event.touches[0];
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - (rect.left + rect.width / 2)) / 20;
    const y = (touch.clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - (rect.left + rect.width / 2)) / 20;
    const y = (touch.clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  }, []);

  // Mobile tap effect
  const handleClick = useCallback(() => {
    // Only apply tap effect on touch devices
    if (!('ontouchstart' in window)) return;

    if (!isHovering) {
      setIsHovering(true);
      setMousePosition({ x: 3, y: -3 });

      setTimeout(() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }, 300);
    }
  }, [isHovering]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1.006, 1.006, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.18s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
      className={cn(
        "w-full relative overflow-hidden focus-within:ring-2 focus-within:ring-white/40 focus-within:ring-offset-2 focus-within:ring-offset-[#0a0a0a]",
        containerClassName
      )}
    >
      <motion.div
        style={{
          transform: isHovering
            ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.015, 1.015, 1)`
            : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
          transition: "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
        className={cn("h-full w-full", className)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

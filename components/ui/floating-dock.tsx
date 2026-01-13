import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  return (
    // Fitts's Law: minimum 44x44px touch targets for mobile
    <div className={cn("flex md:hidden items-center justify-evenly gap-3 w-full", className)}>
      {items.map((item) => (
        <a
          key={item.title}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[52px] w-[52px] min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#f1f1f1] border-[2.5px] border-white active:scale-95 transition-all duration-150 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
          aria-label={item.title}
        >
          <div className="h-6 w-6 transition-transform duration-150">{item.icon}</div>
        </a>
      ))}
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-[4.5rem] items-end gap-3 px-0 pb-0 md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [58, 90, 58]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [58, 90, 58]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [26, 42, 26]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [26, 42, 26],
  );

  let width = useSpring(widthTransform, {
    mass: 0.06,
    stiffness: 280,
    damping: 16,
  });
  let height = useSpring(heightTransform, {
    mass: 0.06,
    stiffness: 280,
    damping: 16,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.04,
    stiffness: 300,
    damping: 18,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.04,
    stiffness: 300,
    damping: 18,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href} className="focus-visible:outline-none">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-[#f1f1f1] border-[2.5px] border-white shadow-sm hover:shadow-lg transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, x: "-50%", scale: 0.92 }}
              animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
              exit={{ opacity: 0, y: 3, x: "-50%", scale: 0.96 }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              className="absolute -top-10 left-1/2 w-fit rounded-lg border border-white/[0.08] bg-black/95 backdrop-blur-md px-3 py-1.5 text-xs font-medium whitespace-pre text-white shadow-xl"
            >
              {title}
              {/* Tooltip arrow */}
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-black/95 border-r border-b border-white/[0.08] rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}

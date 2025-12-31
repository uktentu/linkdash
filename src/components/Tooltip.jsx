import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

export function Tooltip({ children, content, side = 'bottom' }) {
    const [isVisible, setIsVisible] = useState(false);

    const variants = {
        hidden: { opacity: 0, scale: 0.9, y: side === 'bottom' ? -5 : 5 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    const positionClasses = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2'
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={variants}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute z-50 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-xl ${positionClasses[side]}`}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

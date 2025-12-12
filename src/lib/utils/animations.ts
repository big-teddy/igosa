/**
 * Animation Utilities
 * Framer Motion variants for consistent animations across the app
 * Respects user's prefers-reduced-motion preference
 */

import type { Variants } from "framer-motion";

/**
 * Subtle fade in animation
 */
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Subtle slide up animation
 */
export const slideUp: Variants = {
    initial: { y: 10, opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
        y: -10,
        opacity: 0,
        transition: { duration: 0.15 }
    },
};

/**
 * Subtle scale in animation
 */
export const scaleIn: Variants = {
    initial: { scale: 0.98, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
        scale: 0.98,
        opacity: 0,
        transition: { duration: 0.15 }
    },
};

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

/**
 * List item animation (for stagger)
 */
export const listItem: Variants = {
    initial: { opacity: 0, x: -10 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.2 }
    },
};

/**
 * Modal/Dialog animation
 */
export const modal: Variants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
        scale: 0.95,
        opacity: 0,
        transition: { duration: 0.15 }
    },
};

/**
 * Slide from right (mobile menu, etc.)
 */
export const slideFromRight: Variants = {
    initial: { x: "100%" },
    animate: {
        x: 0,
        transition: { duration: 0.25, ease: "easeOut" }
    },
    exit: {
        x: "100%",
        transition: { duration: 0.2 }
    },
};

/**
 * Slide from bottom (mobile sheet, etc.)
 */
export const slideFromBottom: Variants = {
    initial: { y: "100%" },
    animate: {
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
        y: "100%",
        transition: { duration: 0.25 }
    },
};

/**
 * Check for reduced motion preference
 */
export function shouldReduceMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get animation variants with reduced motion support
 */
export function getAnimationVariants(variants: Variants): Variants {
    if (shouldReduceMotion()) {
        // Return instant transitions for reduced motion
        return {
            initial: { opacity: 1 },
            animate: { opacity: 1 },
            exit: { opacity: 1 },
        };
    }
    return variants;
}

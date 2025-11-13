'use client'

import { motion, Variants } from "framer-motion"
import { RefObject } from "react"
import { cn } from "@/lib/utils"

interface TimelineContentProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  animationNum: number
  timelineRef: RefObject<HTMLElement>
  customVariants?: Variants
  className?: string
}

export function TimelineContent({
  children,
  as: Component = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
}: TimelineContentProps) {
  const defaultVariants: Variants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  }

  const variants = customVariants || defaultVariants

  return (
    <motion.div
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={variants}
      className={cn(className)}
    >
      {Component !== "div" ? (
        <Component className={className}>{children}</Component>
      ) : (
        children
      )}
    </motion.div>
  )
}

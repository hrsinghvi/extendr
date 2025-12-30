import { motion } from "framer-motion";

export function GradientBackground() {
  return (
    <>
      {/* Radial gradient background */}
      <div className="fixed inset-0 z-0">
        {/* First gradient layer */}
        <motion.div
          className="absolute bottom-[-550px] left-1/2 -translate-x-1/2 w-[150vw] h-[130vh]"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(111,151,179,1.0) 0%, rgba(125,167,194,1.0) 25%, rgba(90,150,101,0.9) 55%, rgba(12,17,17,0) 75%)",
            filter: "blur(45px)",
            opacity: 0.95,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />
        {/* Second gradient layer */}
        <motion.div
          className="absolute bottom-[-550px] left-1/2 -translate-x-1/2 w-[100vw] h-[90vh]"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(152,193,218,1.0) 0%, rgba(111,151,179,0.7) 35%, rgba(90,150,101,0.25) 55%, rgba(90,150,101,0) 70%)",
            filter: "blur(30px)",
            opacity: 0.9,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-35 mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 250 250'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.75'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "260px 260px",
          }}
        />
      </div>
    </>
  );
}

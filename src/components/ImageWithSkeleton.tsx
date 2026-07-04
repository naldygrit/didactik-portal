import { useState } from "react";
import { motion } from "framer-motion";
import { DkFieldError } from "./dk/DkFieldError";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  /** Set to true for above-the-fold images (e.g. hero) to boost LCP */
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function ImageWithSkeleton({
  src,
  alt,
  className = "",
  skeletonClassName = "",
  priority = false,
  width,
  height,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative">
      {/* Skeleton Loader */}
      {!isLoaded && !hasError && (
        <div
          role="status"
          className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse motion-reduce:animate-none rounded ${skeletonClassName}`}
        >
          <span className="sr-only">Loading image</span>
        </div>
      )}

      {/* Actual Image */}
      <motion.img
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        width={width}
        height={height}
      />

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <DkFieldError className="text-gray-400 text-sm">Failed to load image</DkFieldError>
        </div>
      )}
    </div>
  );
}

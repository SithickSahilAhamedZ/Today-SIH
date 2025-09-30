import React from 'react';

interface SkeletonLoaderProps {
  lines?: number;
  showAvatar?: boolean;
  showButton?: boolean;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  lines = 3, 
  showAvatar = false, 
  showButton = false,
  className = ''
}) => {
  return (
    <div className={`animate-pulse p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {showAvatar && (
          <div className="rounded-full bg-gray-200 h-12 w-12 flex-shrink-0"></div>
        )}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index}
            className={`h-3 bg-gray-200 rounded ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          ></div>
        ))}
      </div>
      
      {showButton && (
        <div className="mt-4">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      )}
    </div>
  );
};

export default SkeletonLoader;
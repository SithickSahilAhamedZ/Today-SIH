import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'blue' | 'red' | 'green';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'orange', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    orange: 'border-orange-600 border-t-transparent',
    blue: 'border-blue-600 border-t-transparent',
    red: 'border-red-600 border-t-transparent',
    green: 'border-green-600 border-t-transparent'
  };

  const textColorClasses = {
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-6">
      <div 
        className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      ></div>
      {text && (
        <p className={`text-sm font-medium ${textColorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
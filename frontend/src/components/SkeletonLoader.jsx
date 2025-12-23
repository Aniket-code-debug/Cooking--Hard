import React from 'react';

const SkeletonLoader = ({
    variant = 'card',
    count = 1,
    height = 'auto',
    className = ''
}) => {
    const renderSkeleton = () => {
        switch (variant) {
            case 'card':
                return (
                    <div className={`bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse ${className}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 animate-pulse ${className}`}>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 animate-pulse ${className}`}>
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'metric':
                return (
                    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse ${className}`}>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                );

            default:
                return (
                    <div className={`h-${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}></div>
                );
        }
    };

    return (
        <>
            {[...Array(count)].map((_, index) => (
                <div key={index} className="mb-3">
                    {renderSkeleton()}
                </div>
            ))}
        </>
    );
};

export default SkeletonLoader;

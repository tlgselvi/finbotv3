'use client';

import * as React from 'react';
import { Suspense } from 'react';

// Lazy load the chart component
const ChartComponent = React.lazy(() => import('./chart'));

interface LazyChartProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function LazyChart({ children, className, ...props }: LazyChartProps) {
  return (
    <Suspense 
      fallback={
        <div className={`flex items-center justify-center p-8 ${className}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <ChartComponent {...props} className={className}>
        {children}
      </ChartComponent>
    </Suspense>
  );
}

// Re-export all chart components with lazy loading
export const Chart = React.lazy(() => import('./chart').then(module => ({ default: module.Chart })));
export const ChartContainer = React.lazy(() => import('./chart').then(module => ({ default: module.ChartContainer })));
export const ChartTooltip = React.lazy(() => import('./chart').then(module => ({ default: module.ChartTooltip })));
export const ChartTooltipContent = React.lazy(() => import('./chart').then(module => ({ default: module.ChartTooltipContent })));
export const ChartLegend = React.lazy(() => import('./chart').then(module => ({ default: module.ChartLegend })));
export const ChartLegendContent = React.lazy(() => import('./chart').then(module => ({ default: module.ChartLegendContent })));

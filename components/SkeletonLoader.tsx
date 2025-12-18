import React from 'react';

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
    <div className="aspect-square bg-slate-200 dark:bg-slate-700" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  </div>
);

export const OrderCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40" />
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC = () => (
  <tr className="animate-pulse">
    <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" /></td>
    <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
    <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
    <td className="p-5"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16" /></td>
    <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
  </tr>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-24" />
        <div className="h-8 bg-slate-200 dark:bg-slate-600 rounded w-20" />
      </div>
      <div className="h-10 w-10 bg-slate-200 dark:bg-slate-600 rounded-full" />
    </div>
  </div>
);

export const DeliveryCardSkeleton: React.FC = () => (
  <div className="border dark:border-slate-700 rounded-lg p-4 animate-pulse space-y-4">
    <div className="flex justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      </div>
      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </div>
    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded space-y-2">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
    </div>
    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
  </div>
);

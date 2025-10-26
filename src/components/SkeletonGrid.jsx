import React, { useState } from "react";

export default function SkeletonGrid({ count = 3 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-800 p-4 rounded-2xl shadow-sm animate-pulse"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-16"></div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, j) => (
              <div key={j} className="h-8 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

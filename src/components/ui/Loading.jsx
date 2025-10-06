import React from "react";

const Loading = ({ type = "cards" }) => {
  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2 mb-3"></div>
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/3"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-20"></div>
            </div>
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  );
};

export default Loading;
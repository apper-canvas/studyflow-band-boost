import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "Nothing here yet", 
  message = "Get started by adding your first item",
  icon = "Inbox",
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-8 mb-6">
        <ApperIcon name={icon} size={64} className="text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-center mb-8 max-w-md">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <ApperIcon name={action.icon || "Plus"} size={20} />
          {action.label}
        </button>
      )}
    </div>
  );
};

export default Empty;
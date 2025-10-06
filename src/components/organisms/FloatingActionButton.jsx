import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const FloatingActionButton = ({ onClick, icon = "Plus" }) => {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-full shadow-2xl flex items-center justify-center z-30 hover:shadow-accent/30 transition-shadow duration-200"
    >
      <ApperIcon name={icon} size={28} className="text-white" />
    </motion.button>
  );
};

export default FloatingActionButton;
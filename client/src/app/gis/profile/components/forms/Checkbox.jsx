import React from "react";

const Checkbox = React.memo(
  ({ name, label, value, checked, onChange, ...props }) => (
    <label className="flex items-center space-x-2 mb-2">
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        {...props}
      />
      <span className="text-gray-700">{label}</span>
    </label>
  )
);

export default Checkbox;
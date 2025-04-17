import React from "react";

const TabContent = React.memo(({ title, children, tabNumber, isSaved }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      {isSaved && (
        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
          Saved
        </span>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
));

export default TabContent;
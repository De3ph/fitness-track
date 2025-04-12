interface MovementDetailsProps {
  category?: string;
  description?: string;
}

export function MovementDetails({ category, description }: MovementDetailsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {category && (
        <div className="mb-2">
          <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
            {category}
          </span>
        </div>
      )}
      
      {description && (
        <div className="mt-4 text-gray-600 dark:text-gray-300">
          <p className="whitespace-pre-wrap">{description}</p>
        </div>
      )}
    </div>
  );
}
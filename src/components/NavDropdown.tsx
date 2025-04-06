// src/components/NavDropdown.tsx
import Link from "next/link";

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface NavDropdownProps {
  items: DropdownItem[];
  title: string;
}

export default function NavDropdown({ items, title }: NavDropdownProps) {
  // Function to split items into columns (default 2)
  const splitIntoColumns = (
    items: DropdownItem[],
    columnsCount: number = 2
  ) => {
    const result = [];
    const itemsPerColumn = Math.ceil(items.length / columnsCount);

    for (let i = 0; i < columnsCount; i++) {
      const startIndex = i * itemsPerColumn;
      const columnItems = items.slice(startIndex, startIndex + itemsPerColumn);
      if (columnItems.length > 0) {
        result.push(columnItems);
      }
    }

    return result;
  };

  const columns = splitIntoColumns(items);

  return (
    <div className="mega-dropdown">
      <div className="mega-dropdown-content bg-white">
        <div className="mega-dropdown-header border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {title === "U.S. History" && (
            <p className="text-sm text-gray-600 mt-1">
              All the major chapters in the American story, from Indigenous
              beginnings to the present day.
            </p>
          )}
        </div>

        <div className="mega-dropdown-columns">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="mega-dropdown-column">
              {column.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

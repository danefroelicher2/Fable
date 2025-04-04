// src/components/NavDropdown.tsx
import Link from "next/link";

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface NavDropdownProps {
  items: DropdownItem[];
}

export default function NavDropdown({ items }: NavDropdownProps) {
  return (
    <div className="absolute z-50 left-0 era-dropdown">
      {/* Added invisible padding area for mouse movement */}
      <div className="h-3 invisible"></div>

      {/* Actual dropdown content */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-2 w-64">
        <div className="py-1">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="font-medium">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-500">{item.description}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container">
        <span className="navbar-brand">Image Processing Tools</span>
        <div className="navbar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

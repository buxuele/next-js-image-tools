"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow">
      <div className="container">
        <span className="navbar-brand fw-bold text-white">图像处理工具</span>
        <div className="navbar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              className={`nav-link px-3 ${
                pathname === item.href ? "active" : "text-light"
              }`}
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

'use client';

import React, { useState } from 'react';
import { Home, Trophy, Zap, Menu, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'All Winners', href: '/luckyhaus/winners', icon: Trophy },
    { name: 'MemeHaus', href: '/memehaus', icon: Zap, external: false },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="relative z-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-1">
        {menuItems.map((item) => (
          item.external ? (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
            </a>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.href)
                ? 'text-white bg-gray-800'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          )
        ))}
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl md:hidden">
          {menuItems.map((item) => (
            item.external ? (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </a>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 text-sm ${isActive(item.href)
                  ? 'text-white bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
}

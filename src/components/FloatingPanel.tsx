import { useState, useEffect } from 'react';

  interface FloatingPanelProps {
    title: string;
    children: React.ReactNode;  // N'importe quel contenu React
    onClose: () => void;
    defaultPosition?: { x: number; y: number };
  }
   export function FloatingPanel({
    title,
    children,
    onClose,
    defaultPosition = { x: 100, y: 100 }
  }: FloatingPanelProps) {
    const [position, setPosition] = useState(defaultPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Ajouter les listeners globaux
    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
      <div
        className="fixed bg-gray-800 rounded-lg shadow-2xl border border-gray-700 min-w-[300px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000
        }}
      >
        {/* Barre de titre draggable */}
        <div
          className="bg-gray-900 p-3 rounded-t-lg flex justify-between items-center cursor-move"
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-white font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 text-white">
          {children}
        </div>
      </div>
    );
  }
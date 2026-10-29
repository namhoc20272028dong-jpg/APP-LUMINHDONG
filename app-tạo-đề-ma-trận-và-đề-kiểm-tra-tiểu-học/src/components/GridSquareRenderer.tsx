import React from 'react';
import { GridSquareData } from '../types/exam';

interface Props {
  data: GridSquareData;
}

export const GridSquareRenderer: React.FC<Props> = ({ data }) => {
  const { cols = 8, rows = 5, shapeType = 'rectangle', caption } = data;
  const cellSize = 30; // 30px per 1cm unit in display
  const width = cols * cellSize;
  const height = rows * cellSize;

  return (
    <div className="my-3 inline-block p-2 bg-white rounded border border-slate-300 shadow-sm print:border-black">
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="border border-slate-400 select-none bg-slate-50/50"
          style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '15px 15px' }}
        >
          <defs>
            <pattern id="gridPattern" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
              <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="none" />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width={width} height={height} fill="url(#gridPattern)" />

          {/* Render geometric shapes on grid based on shapeType */}
          {shapeType === 'square' && (
            <rect
              x={cellSize * 1}
              y={cellSize * 1}
              width={cellSize * 2}
              height={cellSize * 2}
              fill="#bfdbfe"
              fillOpacity="0.6"
              stroke="#1d4ed8"
              strokeWidth="2"
            />
          )}

          {shapeType === 'rectangle' && (
            <rect
              x={cellSize * 1}
              y={cellSize * 1}
              width={cellSize * 4}
              height={cellSize * 2}
              fill="#fed7aa"
              fillOpacity="0.6"
              stroke="#ea580c"
              strokeWidth="2"
            />
          )}

          {shapeType === 'parallelogram' && (
            <polygon
              points={`
                ${cellSize * 2},${cellSize * 1} 
                ${cellSize * 7},${cellSize * 1} 
                ${cellSize * 5},${cellSize * 4} 
                ${cellSize * 0},${cellSize * 4}
              `}
              fill="#bbf7d0"
              fillOpacity="0.6"
              stroke="#15803d"
              strokeWidth="2"
            />
          )}

          {shapeType === 'triangle' && (
            <polygon
              points={`
                ${cellSize * 3},${cellSize * 1} 
                ${cellSize * 6},${cellSize * 4} 
                ${cellSize * 1},${cellSize * 4}
              `}
              fill="#fef08a"
              fillOpacity="0.6"
              stroke="#b45309"
              strokeWidth="2"
            />
          )}

          {/* Height marker line for parallelogram / triangle if applicable */}
          {shapeType === 'parallelogram' && (
            <>
              <line
                x1={cellSize * 2}
                y1={cellSize * 1}
                x2={cellSize * 2}
                y2={cellSize * 4}
                stroke="#dc2626"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* Right angle symbol */}
              <rect
                x={cellSize * 2}
                y={cellSize * 4 - 8}
                width={8}
                height={8}
                fill="none"
                stroke="#dc2626"
                strokeWidth="1.2"
              />
              <text x={cellSize * 2 + 4} y={cellSize * 2.6} fontSize="11" fill="#dc2626" fontWeight="bold">
                h = 3 cm
              </text>
              <text x={cellSize * 2.2} y={cellSize * 4 + 18} fontSize="11" fill="#15803d" fontWeight="bold">
                đáy a = 5 cm
              </text>
            </>
          )}
        </svg>
      </div>
      {caption && (
        <div className="text-xs text-center text-slate-500 mt-1 font-medium italic">
          {caption}
        </div>
      )}
    </div>
  );
};

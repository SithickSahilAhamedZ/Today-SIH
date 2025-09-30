import React from 'react';
import { TEMPLES } from '../constants';
import { Temple } from '../types';

interface TempleSelectorProps {
  selectedTemple: Temple;
  onTempleChange: (temple: Temple) => void;
}

const TempleSelector: React.FC<TempleSelectorProps> = ({ selectedTemple, onTempleChange }) => {
  const handleTempleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const templeId = parseInt(event.target.value);
    const temple = TEMPLES.find(t => t.id === templeId);
    if (temple) {
      onTempleChange(temple);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-xl shadow-lg">
          <iconify-icon icon="solar:temple-hindu-bold" className="text-white text-2xl"></iconify-icon>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Select Temple</h3>
          <p className="text-sm text-gray-600 mb-3">Choose your sacred destination</p>
          <select
            id="temple-select"
            value={selectedTemple.id}
            onChange={handleTempleChange}
            className="w-full px-4 py-3 text-base font-medium border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 bg-gray-50 hover:bg-white hover:border-gray-300 transition-all duration-300 cursor-pointer appearance-none"
            style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
          >
            {TEMPLES.map((temple) => (
              <option key={temple.id} value={temple.id} className="py-2 font-medium">
                {temple.name} • {temple.location}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TempleSelector;
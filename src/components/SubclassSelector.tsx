import type { SubclassOption } from '../classes/base/ClassDefinition';

interface SubclassSelectorProps {
    subclasses: SubclassOption[];
    onSelect: (subclass: string) => void;
    selectedSubclass?: string;
}

const COLOR_CLASSES = {
    blue: 'bg-blue-600 border-blue-400',
    green: 'bg-green-600 border-green-400',
    red: 'bg-red-600 border-red-400',
    purple: 'bg-purple-600 border-purple-400',
    orange: 'bg-orange-600 border-orange-400',
    yellow: 'bg-yellow-600 border-yellow-400',
    pink: 'bg-pink-600 border-pink-400',
    gray: 'bg-gray-600 border-gray-400',
    rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 border-purple-400'
};

export function SubclassSelector({ subclasses, onSelect, selectedSubclass }: SubclassSelectorProps) {
    return (
        <div className="space-y-2">
            {subclasses.map((subclass) => {
                const isSelected = selectedSubclass === subclass.id;
                const colorClass = COLOR_CLASSES[subclass.color as keyof typeof COLOR_CLASSES] || 'bg-gray-600 border-gray-400';
                
                return (
                    <button
                        key={subclass.id}
                        onClick={() => onSelect(subclass.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                            isSelected 
                                ? `${colorClass} text-white border-2`
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                        }`}
                    >
                        <div className="font-semibold">{subclass.name}</div>
                        <div className="text-xs text-gray-400">
                            {subclass.description}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
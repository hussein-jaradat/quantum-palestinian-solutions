import { useState } from 'react';
import { GOVERNORATES } from '@/data/weatherData';
import { Governorate } from '@/types/weather';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '@/components/ui/popover';
import { MapPin, ChevronDown, Check } from 'lucide-react';

interface GovernorateSelectorProps {
  selectedGovernorate: Governorate;
  onSelect: (governorate: Governorate) => void;
}

const GovernorateSelector = ({ selectedGovernorate, onSelect }: GovernorateSelectorProps) => {
  const [open, setOpen] = useState(false);

  const regions = {
    north: { label: 'شمال الضفة', governorates: GOVERNORATES.filter(g => g.region === 'north') },
    center: { label: 'وسط الضفة', governorates: GOVERNORATES.filter(g => g.region === 'center') },
    south: { label: 'جنوب الضفة', governorates: GOVERNORATES.filter(g => g.region === 'south') },
    gaza: { label: 'قطاع غزة', governorates: GOVERNORATES.filter(g => g.region === 'gaza') },
  };

  const handleSelect = (governorate: Governorate) => {
    onSelect(governorate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between h-12 px-4 bg-card hover:bg-secondary/50 border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <MapPin size={18} className="text-primary" />
            </div>
            <div className="text-right">
              <span className="font-medium">{selectedGovernorate.nameAr}</span>
              <span className="text-muted-foreground text-xs mr-2">
                ({selectedGovernorate.nameEn})
              </span>
            </div>
          </div>
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm">اختر المحافظة</h3>
          <p className="text-xs text-muted-foreground">جميع محافظات فلسطين</p>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(regions).map(([key, region]) => (
            <div key={key} className="mb-3">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {region.label}
              </div>
              <div className="space-y-0.5">
                {region.governorates.map((gov) => (
                  <button
                    key={gov.id}
                    onClick={() => handleSelect(gov)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedGovernorate.id === gov.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{gov.nameAr}</span>
                      <span className="text-xs text-muted-foreground">({gov.nameEn})</span>
                    </div>
                    {selectedGovernorate.id === gov.id && (
                      <Check size={14} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GovernorateSelector;

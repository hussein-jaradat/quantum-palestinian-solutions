import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserType, UserProfile } from '@/types/weather';
import { User, Leaf, Building2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserTypeSelectorProps {
  selectedType: UserType;
  onTypeChange: (type: UserType) => void;
}

const USER_PROFILES: UserProfile[] = [
  {
    type: 'citizen',
    nameAr: 'المواطن',
    icon: '👨‍👩‍👧‍👦',
    description: 'معلومات يومية للحياة العامة',
    features: ['تنبؤات يومية', 'نصائح الملابس', 'تنبيهات السلامة', 'أوقات الصلاة']
  },
  {
    type: 'farmer',
    nameAr: 'المزارع',
    icon: '🌾',
    description: 'إرشادات زراعية متخصصة',
    features: ['مواعيد الري', 'تحذيرات الصقيع', 'أفضل أوقات الزراعة', 'رطوبة التربة']
  },
  {
    type: 'institution',
    nameAr: 'المؤسسات',
    icon: '🏛️',
    description: 'بيانات للتخطيط المؤسسي',
    features: ['تقارير مفصلة', 'إحصائيات', 'تنبؤات طويلة', 'تصدير البيانات']
  },
  {
    type: 'relief',
    nameAr: 'الإغاثة',
    icon: '🚑',
    description: 'تنبيهات الطوارئ والكوارث',
    features: ['إنذارات مبكرة', 'خرائط الخطر', 'مناطق الإخلاء', 'تنسيق الإغاثة']
  }
];

const UserTypeSelector = ({ selectedType, onTypeChange }: UserTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {USER_PROFILES.map((profile) => (
        <Card 
          key={profile.type}
          className={cn(
            "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
            selectedType === profile.type 
              ? "ring-2 ring-primary bg-primary/5 shadow-weather" 
              : "glass-effect hover:bg-secondary/50"
          )}
          onClick={() => onTypeChange(profile.type)}
        >
          <CardContent className="p-4 text-center">
            <span className="text-4xl mb-3 block">{profile.icon}</span>
            <h3 className="font-bold text-lg mb-1">{profile.nameAr}</h3>
            <p className="text-xs text-muted-foreground mb-3">{profile.description}</p>
            
            <div className="flex flex-wrap gap-1 justify-center">
              {profile.features.slice(0, 2).map((feature, i) => (
                <Badge 
                  key={i} 
                  variant={selectedType === profile.type ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserTypeSelector;

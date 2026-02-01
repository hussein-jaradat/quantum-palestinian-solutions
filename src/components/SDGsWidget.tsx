import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, Shield, Leaf, Heart, Building, Users, 
  Droplets, Sun, TrendingUp, Target
} from 'lucide-react';

interface SDGGoal {
  id: number;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  color: string;
  relevance: number;
  description: string;
  impact: string[];
}

const SDGsWidget = () => {
  const sdgGoals: SDGGoal[] = [
    {
      id: 13,
      name: 'Climate Action',
      nameAr: 'العمل المناخي',
      icon: <Globe className="h-6 w-6" />,
      color: 'bg-green-600',
      relevance: 95,
      description: 'اتخاذ إجراءات عاجلة للتصدي لتغير المناخ وآثاره',
      impact: [
        'إنذار مبكر للظواهر الجوية المتطرفة',
        'تحليل أنماط التغير المناخي',
        'دعم التكيف مع المناخ',
        'تقليل الخسائر البشرية والمادية'
      ]
    },
    {
      id: 11,
      name: 'Sustainable Cities',
      nameAr: 'مدن مستدامة',
      icon: <Building className="h-6 w-6" />,
      color: 'bg-orange-500',
      relevance: 88,
      description: 'جعل المدن آمنة وقادرة على الصمود ومستدامة',
      impact: [
        'حماية البنية التحتية الحضرية',
        'تخطيط حضري أفضل',
        'إدارة مخاطر الفيضانات',
        'تحسين جودة الحياة'
      ]
    },
    {
      id: 2,
      name: 'Zero Hunger',
      nameAr: 'القضاء على الجوع',
      icon: <Leaf className="h-6 w-6" />,
      color: 'bg-amber-500',
      relevance: 82,
      description: 'تحقيق الأمن الغذائي وتحسين التغذية والزراعة المستدامة',
      impact: [
        'دعم 150,000+ مزارع فلسطيني',
        'تنبيهات الصقيع والري',
        'تحسين إنتاجية المحاصيل',
        'تقليل الخسائر الزراعية'
      ]
    },
    {
      id: 3,
      name: 'Good Health',
      nameAr: 'الصحة الجيدة',
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-red-500',
      relevance: 75,
      description: 'ضمان تمتع الجميع بأنماط حياة صحية',
      impact: [
        'تنبيهات موجات الحر',
        'مراقبة جودة الهواء',
        'تحذيرات الأشعة فوق البنفسجية',
        'حماية الفئات الهشة'
      ]
    },
    {
      id: 6,
      name: 'Clean Water',
      nameAr: 'المياه النظيفة',
      icon: <Droplets className="h-6 w-6" />,
      color: 'bg-blue-500',
      relevance: 70,
      description: 'ضمان توافر المياه وخدمات الصرف الصحي',
      impact: [
        'توقع هطول الأمطار',
        'إدارة الموارد المائية',
        'تخطيط حصاد المياه',
        'مراقبة الجفاف'
      ]
    },
    {
      id: 17,
      name: 'Partnerships',
      nameAr: 'الشراكات',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-purple-600',
      relevance: 65,
      description: 'تعزيز وسائل التنفيذ وتنشيط الشراكة العالمية',
      impact: [
        'تكامل مع المؤسسات الدولية',
        'مشاركة البيانات المفتوحة',
        'التعاون مع NASA و ECMWF',
        'بناء القدرات المحلية'
      ]
    }
  ];

  const impactStats = {
    farmers: '150,000+',
    schools: '2,000+',
    municipalities: '100+',
    reliefOrgs: '20+',
    hospitals: '50+'
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-orange-500/10">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span>أهداف التنمية المستدامة (SDGs)</span>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sun className="h-3 w-3" />
            UN 2030 Agenda
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Impact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-primary/10 rounded-xl">
            <div className="text-2xl font-bold text-primary">{impactStats.farmers}</div>
            <div className="text-xs text-muted-foreground">مزارع</div>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{impactStats.schools}</div>
            <div className="text-xs text-muted-foreground">مدرسة</div>
          </div>
          <div className="text-center p-4 bg-orange-500/10 rounded-xl">
            <div className="text-2xl font-bold text-orange-600">{impactStats.municipalities}</div>
            <div className="text-xs text-muted-foreground">بلدية</div>
          </div>
          <div className="text-center p-4 bg-red-500/10 rounded-xl">
            <div className="text-2xl font-bold text-red-600">{impactStats.hospitals}</div>
            <div className="text-xs text-muted-foreground">مستشفى</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">{impactStats.reliefOrgs}</div>
            <div className="text-xs text-muted-foreground">منظمة إغاثة</div>
          </div>
        </div>

        {/* SDG Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sdgGoals.map((goal) => (
            <div
              key={goal.id}
              className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 bg-card hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl ${goal.color} text-white shrink-0`}>
                  {goal.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm">SDG {goal.id}: {goal.nameAr}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {goal.relevance}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {goal.description}
                  </p>
                  <Progress value={goal.relevance} className="h-1.5 mb-2" />
                  <div className="flex flex-wrap gap-1">
                    {goal.impact.slice(0, 2).map((item, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] py-0">
                        {item}
                      </Badge>
                    ))}
                    {goal.impact.length > 2 && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        +{goal.impact.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="font-bold">الأثر المتوقع بحلول 2030</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">-50%</div>
              <div className="text-xs text-muted-foreground">خسائر الكوارث الجوية</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">+30%</div>
              <div className="text-xs text-muted-foreground">كفاءة الزراعة</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">98%</div>
              <div className="text-xs text-muted-foreground">دقة التنبؤ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">5M+</div>
              <div className="text-xs text-muted-foreground">مستفيد فلسطيني</div>
            </div>
          </div>
        </div>

        {/* UN Logo & Attribution */}
        <div className="text-center pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            🇺🇳 متوافق مع أهداف الأمم المتحدة للتنمية المستدامة 2030
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            NYUAD Hackathon for Social Good in the Arab World
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SDGsWidget;

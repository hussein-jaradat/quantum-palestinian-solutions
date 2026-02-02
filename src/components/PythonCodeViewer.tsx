import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Brain, Atom, TrendingUp } from 'lucide-react';

const algorithms = {
  scientific: [
    { id: 'kalman', name: 'Kalman Filter', lib: 'filterpy' },
    { id: 'arima', name: 'ARIMA', lib: 'statsmodels' },
    { id: 'bayesian', name: 'Bayesian Model Averaging', lib: 'scipy' },
  ],
  ml: [
    { id: 'random_forest', name: 'Random Forest', lib: 'scikit-learn' },
    { id: 'lstm', name: 'LSTM Neural Network', lib: 'TensorFlow' },
    { id: 'xgboost', name: 'XGBoost', lib: 'xgboost' },
  ],
  quantum: [
    { id: 'vqe', name: 'VQE Optimizer', lib: 'Qiskit' },
    { id: 'qsvm', name: 'Quantum SVM', lib: 'qiskit-ml' },
    { id: 'qaoa', name: 'QAOA Solver', lib: 'Qiskit' },
  ],
};

const PythonCodeViewer = () => {
  const [activeCategory, setActiveCategory] = useState('scientific');

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          Python Backend Algorithms
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scientific" className="gap-1">
              <TrendingUp className="h-4 w-4" /> علمية
            </TabsTrigger>
            <TabsTrigger value="ml" className="gap-1">
              <Brain className="h-4 w-4" /> ML
            </TabsTrigger>
            <TabsTrigger value="quantum" className="gap-1">
              <Atom className="h-4 w-4" /> كمومية
            </TabsTrigger>
          </TabsList>
          
          {Object.entries(algorithms).map(([category, algs]) => (
            <TabsContent key={category} value={category} className="space-y-3 mt-4">
              {algs.map((alg) => (
                <div key={alg.id} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                  <span className="font-medium">{alg.name}</span>
                  <Badge variant="outline">{alg.lib}</Badge>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PythonCodeViewer;

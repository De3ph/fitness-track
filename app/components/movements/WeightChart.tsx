import { LineChart } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  chartData: ChartDataPoint[];
}

export function WeightChart({ chartData }: WeightChartProps) {
  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No weight records yet. Complete a workout with this exercise to track your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="h-64 relative">
        {/* Simple Chart Implementation */}
        <div className="absolute inset-0 flex items-end">
          {chartData.map((item, index) => {
            const maxWeight = Math.max(...chartData.map(d => d.weight));
            const heightPercent = (item.weight / maxWeight) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-4/5 bg-blue-500 dark:bg-blue-600 rounded-t" 
                  style={{ height: `${heightPercent}%` }}
                />
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 w-full text-center truncate">
                  {item.date}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between">
          {[...Array(5)].map((_, i) => {
            const maxWeight = Math.max(...chartData.map(d => d.weight));
            const weight = Math.round(maxWeight - (i * (maxWeight / 4)));
            return (
              <div key={i} className="text-xs text-gray-500 dark:text-gray-400">
                {weight} kg
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WeightChartSection({ chartData }: WeightChartProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 flex items-center">
        <LineChart className="h-5 w-5 mr-2" />
        Weight Progress
      </h2>
      <WeightChart chartData={chartData} />
    </section>
  );
}
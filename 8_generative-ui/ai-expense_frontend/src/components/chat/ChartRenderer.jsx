import React from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const CHART_COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#AB47BC', '#00ACC1', '#FF7043']

const ChartRenderer = ({ data }) => {
  const { chartType = 'bar', chartData = [], groupBy = 'category', metric = 'sum' } = data

  if (!chartData || chartData.length === 0) {
    return <div className="text-sm text-gray-500 py-4">No data to display in chart.</div>
  }

  // Ensure values are numbers
  const formattedData = chartData.map(item => ({
    ...item,
    value: Number(item.value || item[metric] || 0),
  }))

  const renderChart = () => {
    switch (chartType.toLowerCase()) {
      case 'bar':
        return (
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => [`₹${value}`, metric.toUpperCase()]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )

      case 'line':
        return (
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => [`₹${value}`, metric.toUpperCase()]}
            />
            <Line type="monotone" dataKey="value" stroke="#4285F4" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} />
          </LineChart>
        )

      case 'area':
      case 'areachat':
        return (
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4285F4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4285F4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => [`₹${value}`, metric.toUpperCase()]}
            />
            <Area type="monotone" dataKey="value" stroke="#4285F4" strokeWidth={2} fillOpacity={1} fill="url(#colorArea)" />
          </AreaChart>
        )

      case 'pie':
        const nonZeroData = formattedData.filter(item => item.value > 0)
        return (
          <PieChart>
            <Pie
              data={nonZeroData}
              cx="40%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {nonZeroData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => [`₹${value}`, metric.toUpperCase()]}
            />
            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        )

      default:
        // Fallback to Bar
        return (
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} />
            <Tooltip formatter={(value) => [`₹${value}`, metric.toUpperCase()]} />
            <Bar dataKey="value" fill="#4285F4" radius={[4, 4, 0, 0]} />
          </BarChart>
        )
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm w-full my-2">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-bold text-gray-800 text-sm capitalize">
            Spending {metric} grouped by {groupBy}
          </h4>
          <p className="text-[10px] text-gray-400">Generative UI Chart • Recharts</p>
        </div>
        <span className="text-[11px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">
          {chartType}
        </span>
      </div>
      <div className="h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ChartRenderer

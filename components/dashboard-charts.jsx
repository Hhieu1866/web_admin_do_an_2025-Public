"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'T1', total: 1200 },
  { name: 'T2', total: 2400 },
  { name: 'T3', total: 1800 },
  { name: 'T4', total: 3000 },
  { name: 'T5', total: 2800 },
  { name: 'T6', total: 4000 },
  { name: 'T7', total: 3500 },
  { name: 'T8', total: 3800 },
  { name: 'T9', total: 4100 },
  { name: 'T10', total: 4500 },
  { name: 'T11', total: 4800 },
  { name: 'T12', total: 5000 },
]

export function DashboardAreaChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng doanh thu</CardTitle>
        <CardDescription>Biểu đồ doanh thu từng tháng trong năm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">
                              Tháng
                            </span>
                            <span className="font-bold text-foreground">
                              {payload[0].payload.name}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">
                              Doanh thu
                            </span>
                            <span className="font-bold text-foreground">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(payload[0].value)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#0284c7"
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

const barData = [
  {
    name: 'T7',
    total: 540,
  },
  {
    name: 'T8',
    total: 620,
  },
  {
    name: 'T9',
    total: 860,
  },
  {
    name: 'T10',
    total: 950,
  },
  {
    name: 'T11',
    total: 1100,
  },
  {
    name: 'T12',
    total: 1430,
  },
]

export function DashboardBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Số người dùng mới</CardTitle>
        <CardDescription>Số lượng người đăng ký mới theo tháng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={barData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorTotal2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">
                              Tháng
                            </span>
                            <span className="font-bold text-foreground">
                              {payload[0].payload.name}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">
                              Người dùng mới
                            </span>
                            <span className="font-bold text-foreground">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#16a34a"
                fillOpacity={1}
                fill="url(#colorTotal2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 
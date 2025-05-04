"use client"

import { StatsCards } from "@/components/stats-cards"
import { DashboardAreaChart, DashboardBarChart } from "@/components/dashboard-charts"
import { MetricsCard } from "@/components/dashboard-metrics"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Calendar, Download, Plus, Users } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // Tránh hydration error
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </div>
      </div>
      <Separator />
      
      <StatsCards />
      
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardAreaChart />
        <DashboardBarChart />
      </div>
      
      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4">
          <MetricsCard />
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Người dùng mới nhất</CardTitle>
                <Button variant="ghost" size="icon">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Người dùng {i + 1}</div>
                      <div className="text-xs text-muted-foreground">user{i + 1}@example.com</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date().toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Khóa học nổi bật</CardTitle>
              <Button variant="ghost" size="icon">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded bg-muted" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Khóa học {i + 1}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(Math.random() * 100)} học viên
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-emerald-500">
                      {Math.floor(Math.random() * 30) + 70}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Buổi học sắp tới</CardTitle>
              <Button variant="ghost" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded bg-muted flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Buổi học {i + 1}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(Date.now() + 86400000 * (i + 1)).toLocaleDateString("vi-VN")} - {Math.floor(Math.random() * 24)}:00
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Chi tiết
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Presentation, Activity } from "lucide-react"

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Tổng người dùng"
        value="13,456"
        description="Tăng 12% so với tháng trước"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Khóa học"
        value="245"
        description="Tăng 8% so với tháng trước"
        icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Buổi học trực tuyến"
        value="56"
        description="Tăng 15% so với tháng trước"
        icon={<Presentation className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Tỷ lệ tham gia"
        value="89%"
        description="Tăng 2% so với tháng trước"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}

function StatsCard({ title, value, description, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
} 
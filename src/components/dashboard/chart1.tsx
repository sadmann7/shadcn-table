'use client'

import { Bar, BarChart, Label, Rectangle, ReferenceLine, XAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { CartesianGrid, Line, LineChart, YAxis } from 'recharts'

import { LabelList } from 'recharts'

import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'

export const Chart1 = () => {
  return (
    <Card className="lg:max-w-md">
      <CardHeader className="space-y-0 pb-2">
        <CardDescription>Today</CardDescription>
        <CardTitle className="text-4xl tabular-nums">
          12,584{' '}
          <span className="text-sm font-sans font-normal tracking-normal text-muted-foreground">
            steps
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            steps: {
              label: 'Steps',
              color: 'hsl(var(--chart-1))',
            },
          }}
        >
          <BarChart
            accessibilityLayer
            margin={{
              left: -4,
              right: -4,
            }}
            data={[
              {
                date: '2024-01-01',
                steps: 2000,
              },
              {
                date: '2024-01-02',
                steps: 2100,
              },
              {
                date: '2024-01-03',
                steps: 2200,
              },
              {
                date: '2024-01-04',
                steps: 1300,
              },
              {
                date: '2024-01-05',
                steps: 1400,
              },
              {
                date: '2024-01-06',
                steps: 2500,
              },
              {
                date: '2024-01-07',
                steps: 1600,
              },
            ]}
          >
            <Bar
              dataKey="steps"
              fill="var(--color-steps)"
              radius={5}
              fillOpacity={0.6}
              activeBar={<Rectangle fillOpacity={0.8} />}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString('en-US', {
                  weekday: 'short',
                })
              }}
            />
            <ChartTooltip
              defaultIndex={2}
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  }}
                />
              }
              cursor={false}
            />
            <ReferenceLine
              y={1200}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeWidth={1}
            >
              <Label
                position="insideBottomLeft"
                value="Average Steps"
                offset={10}
                fill="hsl(var(--foreground))"
              />
              <Label
                position="insideTopLeft"
                value="12,343"
                className="text-lg"
                fill="hsl(var(--foreground))"
                offset={10}
                startOffset={100}
              />
            </ReferenceLine>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <CardDescription>
          Over the past 7 days, you have walked{' '}
          <span className="font-medium text-foreground">53,305</span> steps.
        </CardDescription>
        <CardDescription>
          You need <span className="font-medium text-foreground">12,584</span>{' '}
          more steps to reach your goal.
        </CardDescription>
      </CardFooter>
    </Card>
  )
}

export const Chart2 = () => {
  return (
    <Card className="max-w-xs">
      <CardHeader>
        <CardTitle>Прогрес</CardTitle>
        <CardDescription>На скільки краще ніж минулого місяця</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid auto-rows-min gap-2">
          <div className="text-2xl flex items-baseline gap-1 font-bold tabular-nums leading-none">
            12,453
            <span className="text-sm font-normal text-muted-foreground">
              steps/day
            </span>
          </div>
          <ChartContainer
            config={{
              steps: {
                label: 'Steps',
                color: 'hsl(var(--chart-1))',
              },
            }}
            className="aspect-auto h-[32px] w-full"
          >
            <BarChart
              accessibilityLayer
              layout="vertical"
              margin={{
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
              }}
              data={[
                {
                  date: '2024',
                  steps: 12435,
                },
              ]}
            >
              <Bar
                dataKey="steps"
                fill="var(--color-steps)"
                radius={4}
                barSize={32}
              >
                <LabelList
                  position="insideLeft"
                  dataKey="date"
                  offset={8}
                  fontSize={12}
                  fill="white"
                />
              </Bar>
              <YAxis dataKey="date" type="category" tickCount={1} hide />
              <XAxis dataKey="steps" type="number" hide />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="grid auto-rows-min gap-2">
          <div className="text-2xl flex items-baseline gap-1 font-bold tabular-nums leading-none">
            10,103
            <span className="text-sm font-normal text-muted-foreground">
              steps/day
            </span>
          </div>
          <ChartContainer
            config={{
              steps: {
                label: 'Steps',
                color: 'hsl(var(--muted))',
              },
            }}
            className="aspect-auto h-[32px] w-full"
          >
            <BarChart
              accessibilityLayer
              layout="vertical"
              margin={{
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
              }}
              data={[
                {
                  date: '2023',
                  steps: 10103,
                },
              ]}
            >
              <Bar
                dataKey="steps"
                fill="var(--color-steps)"
                radius={4}
                barSize={32}
              >
                <LabelList
                  position="insideLeft"
                  dataKey="date"
                  offset={8}
                  fontSize={12}
                  fill="hsl(var(--muted-foreground))"
                />
              </Bar>
              <YAxis dataKey="date" type="category" tickCount={1} hide />
              <XAxis dataKey="steps" type="number" hide />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export const Chart3 = () => {
  return (
    <Card className="max-w-xs">
      <CardContent className="flex gap-4 p-4">
        <div className="grid items-center gap-2">
          <div className="grid flex-1 auto-rows-min gap-0.5">
            <div className="text-sm text-muted-foreground">Move</div>
            <div className="text-xl flex items-baseline gap-1 font-bold tabular-nums leading-none">
              562/600
              <span className="text-sm font-normal text-muted-foreground">
                kcal
              </span>
            </div>
          </div>
          <div className="grid flex-1 auto-rows-min gap-0.5">
            <div className="text-sm text-muted-foreground">Exercise</div>
            <div className="text-xl flex items-baseline gap-1 font-bold tabular-nums leading-none">
              73/120
              <span className="text-sm font-normal text-muted-foreground">
                min
              </span>
            </div>
          </div>
          <div className="grid flex-1 auto-rows-min gap-0.5">
            <div className="text-sm text-muted-foreground">Stand</div>
            <div className="text-xl flex items-baseline gap-1 font-bold tabular-nums leading-none">
              8/12
              <span className="text-sm font-normal text-muted-foreground">
                hr
              </span>
            </div>
          </div>
        </div>
        <ChartContainer
          config={{
            move: {
              label: 'Move',
              color: 'hsl(var(--chart-1))',
            },
            exercise: {
              label: 'Exercise',
              color: 'hsl(var(--chart-2))',
            },
            stand: {
              label: 'Stand',
              color: 'hsl(var(--chart-3))',
            },
          }}
          className="mx-auto aspect-square w-full max-w-[80%]"
        >
          <RadialBarChart
            margin={{
              left: -10,
              right: -10,
              top: -10,
              bottom: -10,
            }}
            data={[
              {
                activity: 'stand',
                value: (8 / 12) * 100,
                fill: 'var(--color-stand)',
              },
              {
                activity: 'exercise',
                value: (46 / 60) * 100,
                fill: 'var(--color-exercise)',
              },
              {
                activity: 'move',
                value: (245 / 360) * 100,
                fill: 'var(--color-move)',
              },
            ]}
            innerRadius="20%"
            barSize={24}
            startAngle={90}
            endAngle={450}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              dataKey="value"
              tick={false}
            />
            <RadialBar dataKey="value" background cornerRadius={5} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export const Chart4 = () => {
  return (
    <Card className="flex flex-col lg:max-w-md">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
        <div>
          <CardDescription>Resting HR</CardDescription>
          <CardTitle className="text-4xl flex items-baseline gap-1 tabular-nums">
            62
            <span className="text-sm font-normal tracking-normal text-muted-foreground">
              bpm
            </span>
          </CardTitle>
        </div>
        <div>
          <CardDescription>Variability</CardDescription>
          <CardTitle className="text-4xl flex items-baseline gap-1 tabular-nums">
            35
            <span className="text-sm font-normal tracking-normal text-muted-foreground">
              ms
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 items-center">
        <ChartContainer
          config={{
            resting: {
              label: 'Resting',
              color: 'hsl(var(--chart-1))',
            },
          }}
          className="w-full"
        >
          <LineChart
            accessibilityLayer
            margin={{
              left: 14,
              right: 14,
              top: 10,
            }}
            data={[
              {
                date: '2024-01-01',
                resting: 62,
              },
              {
                date: '2024-01-02',
                resting: 72,
              },
              {
                date: '2024-01-03',
                resting: 35,
              },
              {
                date: '2024-01-04',
                resting: 62,
              },
              {
                date: '2024-01-05',
                resting: 52,
              },
              {
                date: '2024-01-06',
                resting: 62,
              },
              {
                date: '2024-01-07',
                resting: 70,
              },
            ]}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
            />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString('en-US', {
                  weekday: 'short',
                })
              }}
            />
            <Line
              dataKey="resting"
              type="natural"
              fill="var(--color-resting)"
              stroke="var(--color-resting)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                fill: 'var(--color-resting)',
                stroke: 'var(--color-resting)',
                r: 4,
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  }}
                />
              }
              cursor={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

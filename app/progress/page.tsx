'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { Card, CardContent } from "@/app/components/ui/card"
import { useStore } from "@/app/context/StoreProvider"
import { Calendar, ChevronRight, LineChart } from "lucide-react"
import { observer } from "mobx-react-lite"
import Link from "next/link"
import {
  countByDate,
  formatIsoDate,
  getLastNDays,
  groupIntoWeeklyData,
  isSameMonth
} from "../utils/dateUtils"

const ProgressPage = observer(() => {
  const { movementStore, workoutStore } = useStore()
  const movements = movementStore.getAllMovements()
  const workoutHistory = workoutStore.getWorkoutHistory()

  // Filter to show movements with records
  const movementsWithRecords = movements.filter(
    (movement) => movement.records.length > 0
  )

  // Get workout frequency data for the chart
  const last30Days = getLastNDays(30)

  const workoutsByDate = countByDate(workoutHistory, (w) =>
    formatIsoDate(w.startTime)
  )

  const activityData = last30Days.map((date) => ({
    date,
    count: workoutsByDate[date] || 0
  }))

  // Group days into weeks for the chart
  const weeklyData = groupIntoWeeklyData(activityData)

  return (
    <AppShell
      header={
        <div className='flex items-center justify-between p-4'>
          <h1 className='text-xl font-bold'>Progress</h1>
        </div>
      }
    >
      <div className='space-y-6'>
        {/* Workout Summary */}
        <section>
          <h2 className='text-lg font-semibold mb-3'>Workout Summary</h2>
          <Card>
            <CardContent className='p-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='border-r border-gray-200 dark:border-gray-700 pr-4'>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    Total Workouts
                  </div>
                  <div className='text-2xl font-bold'>
                    {workoutHistory.length}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    This Month
                  </div>
                  <div className='text-2xl font-bold'>
                    {
                      workoutHistory.filter((w) => isSameMonth(w.startTime))
                        .length
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Workout Frequency Chart */}
        <section>
          <h2 className='text-lg font-semibold mb-3 flex items-center'>
            <Calendar className='h-5 w-5 mr-2' />
            Workout Frequency
          </h2>

          <Card>
            <CardContent className='p-4'>
              {workoutHistory.length === 0 ? (
                <div className='p-4 text-center'>
                  <p className='text-gray-500 dark:text-gray-400'>
                    Complete workouts to see frequency data
                  </p>
                </div>
              ) : (
                <div className='h-64 relative'>
                  <div className='absolute inset-0 flex items-end'>
                    {weeklyData.map((week, index) => {
                      const maxCount = Math.max(
                        ...weeklyData.map((w) => w.count)
                      )
                      const heightPercent =
                        maxCount > 0 ? (week.count / maxCount) * 75 : 0
                      return (
                        <div
                          key={index}
                          className='flex-1 flex flex-col items-center'
                        >
                          <div
                            className='w-4/5 bg-green-500 dark:bg-green-600 rounded-t'
                            style={{ height: `${heightPercent}%` }}
                          />
                          <div className='mt-1 text-xs text-gray-600 dark:text-gray-400 w-full text-center truncate'>
                            {week.week}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Y-axis labels */}
                  <div className='absolute top-0 left-0 h-full flex flex-col justify-between'>
                    {[...Array(4)].map((_, i) => {
                      const maxCount = Math.max(
                        ...weeklyData.map((w) => w.count),
                        1
                      )
                      const count = Math.round(maxCount - i * (maxCount / 3))
                      return (
                        <div
                          key={i}
                          className='text-xs text-gray-500 dark:text-gray-400'
                        >
                          {count}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Strength Progress */}
        <section>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold flex items-center'>
              <LineChart className='h-5 w-5 mr-2' />
              Strength Progress
            </h2>
          </div>

          {movementsWithRecords.length === 0 ? (
            <Card>
              <CardContent className='p-6 text-center'>
                <p className='text-gray-500 dark:text-gray-400'>
                  Complete workouts with exercises to track your strength
                  progress
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              {movementsWithRecords.map((movement) => {
                const records = movement.records
                const latestRecord =
                  records.length > 0
                    ? records.reduce(
                        (latest, record) =>
                          new Date(record.date) > new Date(latest.date)
                            ? record
                            : latest,
                        records[0]
                      )
                    : null

                const oldestRecord =
                  records.length > 1
                    ? records.reduce((oldest, record) => {
                        const daysDiff =
                          (new Date(latestRecord!.date).getTime() -
                            new Date(record.date).getTime()) /
                          (1000 * 3600 * 24)
                        const oldestDiff =
                          (new Date(latestRecord!.date).getTime() -
                            new Date(oldest.date).getTime()) /
                          (1000 * 3600 * 24)
                        return daysDiff > 7 && daysDiff > oldestDiff
                          ? record
                          : oldest
                      }, records[0])
                    : null

                // Calculate progress if we have appropriate records
                let progress = 0
                if (
                  latestRecord &&
                  oldestRecord &&
                  latestRecord.id !== oldestRecord.id
                ) {
                  progress = latestRecord.weight - oldestRecord.weight
                }

                return (
                  <Link
                    key={movement.id}
                    href={`/movements/${movement.id}`}
                    className='block border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
                  >
                    <CardContent className='p-4'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <h3 className='font-medium'>{movement.name}</h3>
                          {latestRecord && (
                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                              Latest: {latestRecord.weight} kg ×{" "}
                              {latestRecord.reps} reps
                            </p>
                          )}
                        </div>
                        <div className='flex items-center'>
                          {progress !== 0 && (
                            <span
                              className={`mr-3 font-medium ${
                                progress > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {progress > 0 ? "+" : ""}
                              {progress} kg
                            </span>
                          )}
                          <ChevronRight className='h-5 w-5 text-gray-400' />
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                )
              })}
            </Card>
          )}
        </section>
      </div>
    </AppShell>
  )
})

export default ProgressPage;
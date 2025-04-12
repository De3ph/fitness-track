'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { MovementDetails } from "@/app/components/movements/MovementDetails"
import { MovementForm } from "@/app/components/movements/MovementForm"
import { WeightChartSection } from "@/app/components/movements/WeightChart"
import { WeightHistorySection } from "@/app/components/movements/WeightHistoryRecords"
import { Button } from "@/app/components/ui/button"
import { useStore } from "@/app/context/StoreProvider"
import { ChevronLeft, Edit, Save } from "lucide-react"
import { observer } from "mobx-react-lite"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

const MovementDetailPage = observer(() => {
  const params = useParams()
  const movementId = String(params.id)
  const { movementStore } = useStore()

  const movement = movementStore.getMovement(movementId)
  const weightHistory = movement
    ? movementStore.getMovementHistory(movementId)
    : []

  const [isEditing, setIsEditing] = useState(false)

  const handleSave = (data: {
    name: string
    category: string
    description: string
  }) => {
    if (movement) {
      movement.name = data.name
      movement.category = data.category
      movement.description = data.description
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // Process data for chart
  const chartData = weightHistory
    .slice(0, 10)
    .reverse()
    .map((record) => ({
      date: new Date(record.date).toLocaleDateString(),
      weight: record.weight
    }))

  if (!movement) {
    return <div>Movement not found</div>
  }

  return (
    <AppShell
      header={
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center'>
            <Link href='/movements' className='mr-2'>
              <ChevronLeft className='h-5 w-5' />
            </Link>
            <h1 className='text-xl font-bold'>{movement.name}</h1>
          </div>
          {!isEditing ? (
            <Button
              size='sm'
              variant='outline'
              onClick={() => setIsEditing(true)}
            >
              <Edit className='h-4 w-4 mr-1' />
              Edit
            </Button>
          ) : (
            <Button size='sm' form='edit-movement-form' type='submit'>
              <Save className='h-4 w-4 mr-1' />
              Save
            </Button>
          )}
        </div>
      }
    >
      <div className='space-y-6'>
        <section>
          {isEditing ? (
            <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
              <MovementForm
                initialName={movement.name}
                initialCategory={movement.category || ""}
                initialDescription={movement.description || ""}
                onSave={handleSave}
                onCancel={handleCancelEdit}
                showCancelButton={true}
                formId='edit-movement-form'
              />
            </div>
          ) : (
            <MovementDetails
              category={movement.category}
              description={movement.description}
            />
          )}
        </section>

        <WeightChartSection chartData={chartData} />

        <WeightHistorySection records={weightHistory.slice(0, 10)} />
      </div>
    </AppShell>
  )
})

export default MovementDetailPage;
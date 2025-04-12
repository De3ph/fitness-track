'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { MovementForm } from "@/app/components/movements/MovementForm"
import { Button } from "@/app/components/ui/button"
import { useStore } from "@/app/context/StoreProvider"
import { ChevronLeft, Save } from "lucide-react"
import { observer } from "mobx-react-lite"
import Link from "next/link"
import { useRouter } from "next/navigation"

const NewMovementPage = observer(() => {
  const router = useRouter()
  const { movementStore } = useStore()

  const handleSave = (data: {
    name: string
    category: string
    description: string
  }) => {
    const { name, category, description } = data
    if (name) {
      movementStore.createMovement(name, description, category)
      router.push("/movements")
    }
  }

  return (
    <AppShell
      header={
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center'>
            <Link href='/movements' className='mr-2'>
              <ChevronLeft className='h-5 w-5' />
            </Link>
            <h1 className='text-xl font-bold'>New Exercise</h1>
          </div>
          <Button size='sm' form='movement-form' type='submit'>
            <Save className='h-4 w-4 mr-1' />
            Save
          </Button>
        </div>
      }
    >
      <div className='space-y-6'>
        <section>
          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
            <MovementForm onSave={handleSave} />
          </div>
        </section>
      </div>
    </AppShell>
  )
})

export default NewMovementPage;
import { formatDate } from "../../utils/dateUtils"

interface WeightRecord {
  id: string
  date: string | Date
  weight: number
  sets: number
  reps: number
}

interface WeightHistoryRecordsProps {
  records: WeightRecord[]
}

export function WeightHistoryRecords({ records }: WeightHistoryRecordsProps) {
  if (records.length === 0) {
    return (
      <div className='p-4 text-center'>
        <p className='text-gray-500 dark:text-gray-400'>No records yet</p>
      </div>
    )
  }

  return (
    <div className='divide-y divide-gray-200 dark:divide-gray-700'>
      {records.map((record) => {
        const formattedDate = formatDate(record.date)
        return (
          <div key={record.id} className='p-4'>
            <div className='flex justify-between'>
              <div>
                <div className='font-medium'>{record.weight} kg</div>
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  {record.sets} {record.sets === 1 ? "set" : "sets"} ×{" "}
                  {record.reps} reps
                </div>
              </div>
              <div className='text-right text-sm text-gray-500 dark:text-gray-400'>
                {formattedDate}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function WeightHistorySection({ records }: WeightHistoryRecordsProps) {
  return (
    <section>
      <h2 className='text-lg font-semibold mb-3'>Recent Records</h2>
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
        <WeightHistoryRecords records={records} />
      </div>
    </section>
  )
}

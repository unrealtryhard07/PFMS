import { GoalForm } from '@/components/goals/GoalForm'
import { Card, CardContent } from '@/components/ui/card'

export default function NewGoalPage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">New savings goal</h1>
      <Card className="bg-surface border-border">
        <CardContent className="pt-6">
          <GoalForm />
        </CardContent>
      </Card>
    </div>
  )
}

import { GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { LoginForm } from './login-form'

export function LoginCard() {
  return (
    <Card className="w-full shadow-lg border-border/60">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <GraduationCap className="size-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription className="text-sm">
          Sign in to your School Management account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}

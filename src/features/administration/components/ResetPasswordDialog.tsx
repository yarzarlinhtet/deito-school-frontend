import { useState, useEffect } from 'react'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Checkbox } from '#/components/ui/checkbox'
import type { UserAdminResponse } from '#/generated/model'
import { useResetUserPassword } from '../hooks/useUsers'

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserAdminResponse | null
}

export function ResetPasswordDialog({ open, onOpenChange, user }: ResetPasswordDialogProps) {
  const resetPassword = useResetUserPassword()
  const [generateRandom, setGenerateRandom] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forceChange, setForceChange] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setGenerateRandom(true)
      setNewPassword('')
      setConfirmPassword('')
      setForceChange(true)
      setShowPw(false)
      setShowConfirm(false)
      setError('')
    }
  }, [open])

  function handleSubmit() {
    setError('')
    if (!generateRandom) {
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }
    if (!user?.id) return
    resetPassword.mutate(
      {
        userId: user.id,
        req: {
          generateRandom,
          newPassword: generateRandom ? undefined : newPassword,
          confirmPassword: generateRandom ? undefined : confirmPassword,
          forceChangeOnLogin: forceChange,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {user?.fullName ? `Reset password for ${user.fullName}.` : 'Reset user password.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div
            className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/40"
            onClick={() => setGenerateRandom((v) => !v)}
          >
            <Checkbox
              checked={generateRandom}
              onCheckedChange={(v) => setGenerateRandom(!!v)}
            />
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <RefreshCw className="size-3.5" />
                Generate random password
              </p>
              <p className="text-xs text-muted-foreground">
                A secure password will be generated and must be changed on next login.
              </p>
            </div>
          </div>

          {!generateRandom && (
            <>
              <div className="grid gap-1.5">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setForceChange((v) => !v)}
          >
            <Checkbox
              id="force-pw-change"
              checked={forceChange}
              onCheckedChange={(v) => setForceChange(!!v)}
            />
            <Label htmlFor="force-pw-change" className="cursor-pointer font-normal">
              Require password change on next login
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={resetPassword.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={resetPassword.isPending}>
            {resetPassword.isPending ? 'Resetting…' : 'Reset Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

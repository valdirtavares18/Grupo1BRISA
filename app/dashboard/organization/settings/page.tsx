'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { Lock, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('As novas senhas não coincidem.')
            setLoading(false)
            return
        }

        if (formData.newPassword.length < 6) {
            setError('A nova senha deve ter no mínimo 6 caracteres.')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    confirmNewPassword: formData.confirmNewPassword
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao alterar senha')
            }

            setSuccess('Senha alterada com sucesso!')
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Configurações"
                description="Gerencie as configurações da sua conta e da organização."
            />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Segurança
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Senha Atual</Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nova Senha</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                                <Input
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    type="password"
                                    value={formData.confirmNewPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md border border-green-200">
                                    {success}
                                </div>
                            )}

                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>Wait...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar Nova Senha
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

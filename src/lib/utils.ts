import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Remove tudo que não é dígito
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  // Ex: 11 99999-9999 (11) ou 11 3333-3333 (10)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false
  
  // Verifica se todos os dígitos são iguais (ex: 99999999999)
  if (/^(\d)\1+$/.test(cleanPhone)) return false
  
  return true
}

export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '')
  
  if (cpf.length !== 11) return false
  
  if (/^(\d)\1+$/.test(cpf)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(10))) return false
  
  return true
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

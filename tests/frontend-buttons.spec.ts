import { test, expect } from '@playwright/test'

const baseURL = 'http://localhost:3001'

test('admin: main buttons and quick actions work', async ({ page }) => {
  await page.goto(`${baseURL}/login`)
  await page.locator('input[type="email"]').fill('admin@eduportal.com')
  await page.locator('input[type="password"]').fill('Admin123!')
  await page.getByRole('button', { name: /iniciar sesión/i }).click()

  await expect(page).toHaveURL(/\/admin$/)

  const quickActions = [
    { label: 'Gestionar Usuarios', href: '/admin/users' },
    { label: 'Gestionar Estudiantes', href: '/admin/students' },
    { label: 'Gestionar Profesores', href: '/admin/professors' },
    { label: 'Gestionar Cursos', href: '/admin/courses' },
    { label: 'Gestionar Secciones', href: '/admin/sections' },
    { label: 'Inscripciones', href: '/admin/enrollments' },
    { label: 'Reportes', href: '/admin/reports' },
    { label: 'Auditoría', href: '/admin/audit' },
  ]

  for (const action of quickActions) {
    await page.goto(`${baseURL}/admin`)
    await page.getByRole('link', { name: new RegExp(action.label, 'i') }).click()
    await expect(page).toHaveURL(new RegExp(`${action.href}$`))
  }
})

test('professor: sidebar buttons and dashboard CTA work', async ({ page }) => {
  await page.goto(`${baseURL}/login`)
  await page.locator('input[type="email"]').fill('jperez@eduportal.com')
  await page.locator('input[type="password"]').fill('Prof123!')
  await page.getByRole('button', { name: /iniciar sesión/i }).click()

  await expect(page).toHaveURL(/\/professor$/)

  const sidebarTargets = [
    { label: 'Dashboard', href: '/professor' },
    { label: 'Mis Secciones', href: '/professor/subjects' },
    { label: 'Asistencia', href: '/professor/attendance' },
    { label: 'Reportes', href: '/professor/reports' },
  ]

  for (const item of sidebarTargets) {
    await page.goto(`${baseURL}/professor`)
    await page.locator('aside nav').getByRole('link', { name: new RegExp(item.label, 'i') }).click()
    await expect(page.locator('body')).not.toContainText('Error')
  }

  await page.goto(`${baseURL}/professor`)
  await page.locator('aside').getByRole('link', { name: /configuración/i }).click()
  await expect(page).toHaveURL(/\/settings$/)

  await page.goto(`${baseURL}/professor`)
  await page.getByRole('link', { name: /nueva clase/i }).click()
  await expect(page).toHaveURL(/\/professor\/subjects$/)
})

test('student: sidebar buttons and quick actions work', async ({ page }) => {
  await page.goto(`${baseURL}/login`)
  await page.locator('input[type="email"]').fill('mrodriguez@eduportal.com')
  await page.locator('input[type="password"]').fill('Estu123!')
  await page.getByRole('button', { name: /iniciar sesión/i }).click()

  await expect(page).toHaveURL(/\/student$/)

  const sidebarTargets = [
    { label: 'Dashboard', href: '/student' },
    { label: 'Escanear QR', href: '/student/scan' },
    { label: 'Mis Asignaturas', href: '/student/subjects' },
    { label: 'Mi Asistencia', href: '/student/attendance' },
  ]

  for (const item of sidebarTargets) {
    await page.goto(`${baseURL}/student`)
    await page.locator('aside nav').getByRole('link', { name: new RegExp(item.label, 'i') }).click()
    await expect(page.locator('body')).not.toContainText('Error')
  }

  await page.goto(`${baseURL}/student`)
  await page.locator('aside').getByRole('link', { name: /configuración/i }).click()
  await expect(page).toHaveURL(/\/settings$/)
})

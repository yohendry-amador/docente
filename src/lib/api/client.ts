const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'



interface ApiResponse<T> {

  data?: T

  error?: string

}



interface LoginResponse {

  accessToken: string

  refreshToken: string

  user: {

    id: string

    email: string

    role: string

  }

}



interface Professor {

  id: string

  firstName: string

  lastName: string

  employeeCode: string

  userId: string

  department?: string

  user?: {

    email: string

  }

}



interface Course {

  id: string

  code: string

  name: string

  description?: string

  credits?: number

}



interface Section {

  id: string

  code: string

  courseId: string

  professorId: string

  schedule: string

  room: string

  semester: string

  year: number

  course: Course

  _count?: {

    enrollments: number

  }

}



interface Session {

  id: string

  sectionId: string

  startTime: string

  endTime: string

  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED'

  qrCode?: string | null

}



interface QRGenerationResponse {

  sessionId: string

  qrData: string

  expiresAt: string

  sectionId: string

}



interface AttendanceRecord {

  id: string

  studentId: string

  sectionId: string

  sessionId: string

  status: 'PRESENT' | 'ABSENT' | 'TARDY' | 'JUSTIFIED'

  method: 'QR_SCAN' | 'MANUAL' | 'PROFESSOR_NOTE'

  recordedAt: string

  student: {

    id: string

    firstName: string

    lastName: string

    studentCode?: string

  }

}



interface AttendanceStats {

  total: number

  present: number

  absent: number

  tardy: number

  justified: number

}



interface RosterStudent {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  email: string
}

interface SectionRosterEntry {
  id: string
  status: string
  student: {
    id: string
    studentCode?: string
    firstName: string
    lastName: string
    user?: {
      email?: string
    }
  }
}

type SectionRoster = SectionRosterEntry[]

interface SectionSummary {

  totalEnrolled: number

  totalAttendanceRecords: number

  presentCount?: number

  absentCount?: number

  tardyCount?: number

  justifiedCount?: number

}



interface ReportAttendanceItem {

  id: string

  studentId: string

  student: {

    firstName: string

    lastName: string

    studentCode?: string

  }

  section: {

    id: string

    code: string

    course: {

      name: string

    }

  }

  session: {

    startTime: string

    endTime: string

  }

  status: 'PRESENT' | 'ABSENT' | 'TARDY' | 'JUSTIFIED'

  method: 'QR_SCAN' | 'MANUAL' | 'PROFESSOR_NOTE'

  recordedAt: string

}



interface AttendanceReport {

  attendances: ReportAttendanceItem[]

  stats: AttendanceStats

}



interface AuthUser {

  id: string

  email: string

  role: string

  professor?: Professor

}



interface Notification {

  id: string

  userId: string

  title: string

  message: string

  type: string

  read: boolean

  createdAt: string

}



interface AdminStats {

  totalUsers: number

  totalStudents: number

  totalProfessors: number

  totalSections: number

  totalCourses: number

  totalEnrollments: number

}



interface User {

  id: string

  email: string

  role: string

  isActive: boolean

  createdAt: string

  student?: { firstName: string; lastName: string }

  professor?: { firstName: string; lastName: string }

}



interface StudentProfile {

  id: string

  studentCode: string

  firstName: string

  lastName: string

  enrollments: Array<{

    id: string

    status: string

    section: Section & { course: Course; professor: { firstName: string; lastName: string } }

  }>

}



interface StudentAttendanceSummary {

  studentId: string

  total: number

  present: number

  absent: number

  tardy: number

  justified: number

  attendanceRate: number

  attendances: Array<{

    id: string

    status: string

    recordedAt: string

    section: { id: string; code: string; course: { name: string }; professor: { firstName: string; lastName: string } }

  }>

}



interface AuditLog {

  id: string

  action: string

  entityType: string

  entityId: string

  oldValues: Record<string, unknown>

  newValues: Record<string, unknown>

  timestamp: string

  user: { id: string; email: string; role: string }

}



class ApiClient {

  private token: string | null = null

  private refreshToken: string | null = null

  private isRefreshing = false

  private refreshPromise: Promise<boolean> | null = null



  constructor() {

    if (typeof window !== 'undefined') {

      this.token = localStorage.getItem('accessToken')

      this.refreshToken = localStorage.getItem('refreshToken')

    }

  }



  private unwrapPayload<T>(payload: unknown): T | undefined {

    if (!payload || typeof payload !== 'object') {

      return payload as T | undefined

    }



    const record = payload as Record<string, unknown>

    if (record.success === true && 'data' in record) {

      return record.data as T

    }



    return payload as T

  }



  private async request<T>(

    endpoint: string,

    options: RequestInit = {},

    attemptRefresh = true

  ): Promise<ApiResponse<T>> {

    const url = `${API_BASE_URL}${endpoint}`



    const headers: HeadersInit = {

      'Content-Type': 'application/json',

      ...options.headers,

    }



    if (this.token) {

      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`

    }



    try {

      const response = await fetch(url, {

        ...options,

        headers,

      })



      if (response.status === 401 && attemptRefresh && this.refreshToken) {

        const refreshed = await this.tryRefreshToken()

        if (refreshed) {

          return this.request<T>(endpoint, options, false)

        }

        this.clearAuth()

        if (typeof window !== 'undefined') {

          window.location.href = '/login'

        }

        return { error: 'Sesión expirada. Por favor inicia sesión nuevamente.' }

      }



      const rawText = await response.text()

      const payload = rawText ? JSON.parse(rawText) : {}



      if (!response.ok) {

        const errorData = this.unwrapPayload<Record<string, unknown>>(payload) || {}

        return {

          error: (errorData as Record<string, unknown>).message as string || (errorData as Record<string, unknown>).error as string || `HTTP ${response.status}: ${response.statusText}`,

        }

      }



      return { data: this.unwrapPayload<T>(payload) }

    } catch (error) {

      console.error(`API Error [${endpoint}]:`, error)

      return {

        error: error instanceof Error ? error.message : 'Network error',

      }

    }

  }



  private async tryRefreshToken(): Promise<boolean> {

    if (this.isRefreshing && this.refreshPromise) {

      return this.refreshPromise

    }



    this.isRefreshing = true

    this.refreshPromise = this.doRefresh()

    const result = await this.refreshPromise

    this.isRefreshing = false

    this.refreshPromise = null

    return result

  }



  private async doRefresh(): Promise<boolean> {

    try {

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ refreshToken: this.refreshToken }),

      })



      if (!response.ok) return false



      const data = await response.json()

      this.setTokens(data.accessToken, data.refreshToken)

      return true

    } catch {

      return false

    }

  }



  isAuthenticated(): boolean {

    if (typeof window === 'undefined') return false

    return !!localStorage.getItem('accessToken')

  }



  private setTokens(accessToken: string, refreshToken: string) {

    this.token = accessToken

    this.refreshToken = refreshToken

    if (typeof window !== 'undefined') {

      localStorage.setItem('accessToken', accessToken)

      localStorage.setItem('refreshToken', refreshToken)

    }

  }



  private clearAuth() {

    this.token = null

    this.refreshToken = null

    if (typeof window !== 'undefined') {

      localStorage.removeItem('accessToken')

      localStorage.removeItem('refreshToken')

      localStorage.removeItem('user')

    }

  }



  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {

    const result = await this.request<LoginResponse>('/auth/login', {

      method: 'POST',

      body: JSON.stringify({ email, password }),

    })



    if (result.data) {

      this.setTokens(result.data.accessToken, result.data.refreshToken)

      if (typeof window !== 'undefined') {

        localStorage.setItem('user', JSON.stringify(result.data.user))

      }

    }



    return result

  }



  async logout() {

    this.clearAuth()

    if (typeof window !== 'undefined') {

      window.location.href = '/login'

    }

  }



  async refreshAccessToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {

    if (!this.refreshToken) {

      return { error: 'No refresh token available' }

    }



    const result = await this.request<{ accessToken: string; refreshToken: string }>(

      '/auth/refresh',

      {

        method: 'POST',

        body: JSON.stringify({ refreshToken: this.refreshToken }),

      }

    )



    if (result.data) {

      this.setTokens(result.data.accessToken, result.data.refreshToken)

    }



    return result

  }



  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {

    const result = await this.request<AuthUser>('/auth/me')

    return result

  }



  async getProfessorProfile(): Promise<ApiResponse<Professor>> {

    return this.request<Professor>('/professors/me/profile')

  }



  async updateProfessorProfile(data: {

    firstName?: string

    lastName?: string

  }): Promise<ApiResponse<Professor>> {

    const userData = await this.request<{ id: string }>('/auth/me')

    if (userData.error || !userData.data) {

      return { error: userData.error || 'No se pudo obtener el usuario' }

    }

    const professorResult = await this.request<Professor>(

      `/professors/user/${userData.data.id}`

    )

    if (professorResult.error || !professorResult.data) {

      return { error: professorResult.error || 'No se pudo obtener el perfil' }

    }

    return this.request<Professor>(`/professors/${professorResult.data.id}`, {

      method: 'PATCH',

      body: JSON.stringify(data),

    })

  }



  async changePassword(data: {

    currentPassword: string

    newPassword: string

  }): Promise<ApiResponse<{ message: string }>> {

    return this.request('/auth/change-password', {

      method: 'POST',

      body: JSON.stringify(data),

    })

  }



  async getProfessorSections(): Promise<ApiResponse<{ sections: Section[] }>> {

    const profileResult = await this.request<Professor>('/professors/me/profile')

    if (profileResult.error || !profileResult.data) {

      return { error: profileResult.error }

    }



    return this.request<{ sections: Section[] }>(

      `/professors/${profileResult.data.id}/sections`

    )

  }



  async getMySections(): Promise<ApiResponse<Section[]>> {

    return this.request<Section[]>('/sections/my-sections')

  }



  async getSection(sectionId: string): Promise<ApiResponse<Section>> {

    return this.request<Section>(`/sections/${sectionId}`)

  }



  async getSectionStudents(

    sectionId: string

  ): Promise<

    ApiResponse<{

      enrollments: Array<{

        student: {

          id: string

          firstName: string

          lastName: string

          studentCode?: string

        }

      }>

    }>

  > {

    return this.request(`/sections/${sectionId}/students`)

  }



async getSectionRoster(sectionId: string): Promise<ApiResponse<SectionRoster>> {
    return this.request<SectionRoster>(`/attendance/section/${sectionId}/roster`)
  }

  async getActiveSession(sectionId: string): Promise<ApiResponse<Session | null>> {

    return this.request<Session | null>(`/sections/${sectionId}/session/active`)

  }



  async generateQRCode(

    sectionId: string,

    durationSeconds?: number

  ): Promise<ApiResponse<QRGenerationResponse>> {

    return this.request<QRGenerationResponse>('/qr/generate', {

      method: 'POST',

      body: JSON.stringify({ sectionId, durationSeconds }),

    })

  }



  async scanQRCode(qrData: string): Promise<ApiResponse<{ success: boolean; message: string }>> {

    return this.request('/qr/scan', {

      method: 'POST',

      body: JSON.stringify({ qrData }),

    })

  }



  async closeQRSession(

    sessionId: string

  ): Promise<ApiResponse<{ message: string }>> {

    return this.request(`/qr/session/${sessionId}`, {

      method: 'DELETE',

    })

  }



  async getSectionAttendance(

    sectionId: string,

    sessionId?: string

  ): Promise<ApiResponse<AttendanceRecord[]>> {

    const query = sessionId ? `?sessionId=${sessionId}` : ''

    return this.request<AttendanceRecord[]>(

      `/attendance/section/${sectionId}${query}`

    )

  }



  async getSectionStats(

    sectionId: string,

    sessionId?: string

  ): Promise<ApiResponse<AttendanceStats>> {

    const query = sessionId ? `?sessionId=${sessionId}` : ''

    return this.request<AttendanceStats>(

      `/attendance/section/${sectionId}/stats${query}`

    )

  }



  async getAttendanceReport(params: {

    sectionId?: string

    studentId?: string

    startDate?: string

    endDate?: string

  }): Promise<ApiResponse<AttendanceReport>> {

    const searchParams = new URLSearchParams()

    if (params.sectionId) searchParams.append('sectionId', params.sectionId)

    if (params.studentId) searchParams.append('studentId', params.studentId)

    if (params.startDate) searchParams.append('startDate', params.startDate)

    if (params.endDate) searchParams.append('endDate', params.endDate)

    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''

    return this.request<AttendanceReport>(`/reports/attendance${query}`)

  }



  async getSectionSummary(

    sectionId: string

  ): Promise<ApiResponse<SectionSummary>> {

    return this.request<SectionSummary>(`/reports/section/${sectionId}/summary`)

  }



  async healthCheck(): Promise<boolean> {

    const result = await this.request<{ status: string }>('/health')

    return !result.error && result.data?.status === 'ok'

  }



  async getNotifications(): Promise<ApiResponse<Notification[]>> {

    return this.request<Notification[]>('/notifications')

  }



  async getUnreadNotificationCount(): Promise<ApiResponse<{ count: number }>> {

    return this.request<{ count: number }>('/notifications/unread-count')

  }



  async markNotificationAsRead(id: string): Promise<ApiResponse<{ success: boolean }>> {

    return this.request(`/notifications/${id}/read`, { method: 'POST' })

  }



  async markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean }>> {

    return this.request('/notifications/read-all', { method: 'POST' })

  }



  async search(query: string): Promise<ApiResponse<{

    students: Array<{ id: string; firstName: string; lastName: string; studentCode: string }>

    sections: Section[]

    courses: Course[]

  }>> {

    return this.request(`/search?q=${encodeURIComponent(query)}`)

  }



  async getAdminStats(): Promise<ApiResponse<AdminStats>> {

    return this.request<AdminStats>('/admin/stats')

  }



  async getAllUsers(page?: number, limit?: number): Promise<ApiResponse<{ users: User[]; total: number; page: number; limit: number }>> {

    const params = new URLSearchParams()

    if (page) params.append('page', page.toString())

    if (limit) params.append('limit', limit.toString())

    const query = params.toString() ? `?${params.toString()}` : ''

    return this.request(`/users${query}`)

  }



  async updateUser(id: string, data: { email?: string; isActive?: boolean; role?: string }): Promise<ApiResponse<User>> {

    return this.request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

  }



  async createUser(data: { email: string; password: string; role: string }): Promise<ApiResponse<{ id: string }>> {

    return this.request<{ id: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) })

  }



  async deleteUser(id: string): Promise<ApiResponse<{ success: boolean }>> {

    return this.request(`/users/${id}`, { method: 'DELETE' })

  }



  async getAllStudents(page?: number, limit?: number, search?: string): Promise<ApiResponse<{ students: Array<{ id: string; studentCode: string; firstName: string; lastName: string; user: { email: string; isActive: boolean } }>; total: number; page: number; limit: number }>> {

    const params = new URLSearchParams()

    if (page) params.append('page', page.toString())

    if (limit) params.append('limit', limit.toString())

    if (search) params.append('search', search)

    const query = params.toString() ? `?${params.toString()}` : ''

    return this.request(`/students${query}`)

  }



  async createStudent(data: { email: string; password: string; studentCode: string; firstName: string; lastName: string }): Promise<ApiResponse<{ id: string }>> {

    return this.request<{ id: string }>('/students', {

      method: 'POST',

      body: JSON.stringify(data),

    })

  }



  async deleteStudent(id: string): Promise<ApiResponse<{ success: boolean }>> {

    return this.request(`/students/${id}`, { method: 'DELETE' })

  }



  async updateStudent(id: string, data: { firstName?: string; lastName?: string; studentCode?: string }): Promise<ApiResponse<StudentProfile>> {

    return this.request<StudentProfile>(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

  }



  async getStudentProfile(): Promise<ApiResponse<StudentProfile>> {

    return this.request<StudentProfile>('/students/me/profile')

  }



  async getStudentAttendanceSummary(): Promise<ApiResponse<StudentAttendanceSummary>> {

    const profileResult = await this.request<{ id: string }>('/students/me/profile')

    if (profileResult.error || !profileResult.data) return { error: profileResult.error }

    return this.request<StudentAttendanceSummary>(`/reports/student/${profileResult.data.id}/summary`)

  }



  async getStudentEnrollments(): Promise<ApiResponse<StudentProfile['enrollments']>> {

    const profileResult = await this.request<{ id: string }>('/students/me/profile')

    if (profileResult.error || !profileResult.data) return { error: profileResult.error }

    return this.request(`/enrollments/student/${profileResult.data.id}`)

  }



  async getAllProfessors(page?: number, limit?: number, search?: string): Promise<ApiResponse<{ professors: Array<{ id: string; employeeCode: string; firstName: string; lastName: string; user: { email: string; isActive: boolean } }>; total: number; page: number; limit: number }>> {

    const params = new URLSearchParams()

    if (page) params.append('page', page.toString())

    if (limit) params.append('limit', limit.toString())

    if (search) params.append('search', search)

    const query = params.toString() ? `?${params.toString()}` : ''

    return this.request(`/professors${query}`)

  }



  async createProfessor(data: { email: string; password: string; employeeCode: string; firstName: string; lastName: string; department?: string }): Promise<ApiResponse<{ id: string }>> {

    const payload = { email: data.email, password: data.password, employeeCode: data.employeeCode, firstName: data.firstName, lastName: data.lastName }

    return this.request<{ id: string }>('/professors', {

      method: 'POST',

      body: JSON.stringify(payload),

    })

  }



  async updateProfessor(id: string, data: { firstName?: string; lastName?: string; employeeCode?: string }): Promise<ApiResponse<Professor>> {

    return this.request<Professor>(`/professors/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

  }



  async deleteProfessor(id: string): Promise<ApiResponse<{ success: boolean }>> {

    return this.request(`/professors/${id}`, { method: 'DELETE' })

  }



  async getAllCourses(page?: number, limit?: number): Promise<ApiResponse<{ courses: Course[]; total: number }>> {

    const params = new URLSearchParams()

    if (page) params.append('page', page.toString())

    if (limit) params.append('limit', limit.toString())

    const query = params.toString() ? `?${params.toString()}` : ''

    return this.request(`/courses${query}`)

  }



  async createCourse(data: { code: string; name: string; description?: string; credits?: number }): Promise<ApiResponse<Course>> {

    return this.request<Course>('/courses', { method: 'POST', body: JSON.stringify(data) })

  }



  async updateCourse(id: string, data: { code?: string; name?: string; description?: string; credits?: number }): Promise<ApiResponse<Course>> {

    return this.request<Course>(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

  }



  async deleteCourse(id: string): Promise<ApiResponse<{ success: boolean }>> {

    return this.request(`/courses/${id}`, { method: 'DELETE' })

  }



  async getAllSections(page?: number, limit?: number): Promise<ApiResponse<{ sections: (Section & { course: Course; professor: { id: string; firstName: string; lastName: string; employeeCode: string } })[]; total: number }>> {

    const params = new URLSearchParams()

    if (page) params.append('page', page.toString())

    if (limit) params.append('limit', limit.toString())

    const query = params.toString() ? `?${params.toString()}` : ''

    return this.request(`/sections${query}`)

  }



  async createSection(data: { code: string; courseId: string; professorId: string; schedule: string; room: string; semester: string; year: number }): Promise<ApiResponse<Section>> {

    return this.request<Section>('/sections', { method: 'POST', body: JSON.stringify(data) })

  }

  async updateSection(id: string, data: { code?: string; courseId?: string; professorId?: string; schedule?: string; room?: string; semester?: string; year?: number }): Promise<ApiResponse<Section>> {
    return this.request<Section>('/sections/' + id, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteSection(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request('/sections/' + id, { method: 'DELETE' })
  }

  async enrollStudent(data: { studentId: string; sectionId: string }): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>('/enrollments', { method: 'POST', body: JSON.stringify(data) })
  }

  async getSectionEnrollments(sectionId: string): Promise<ApiResponse<Array<{ id: string; student: { id: string; studentCode: string; firstName: string; lastName: string }; status: string }>>> {

    return this.request(`/enrollments/section/${sectionId}`)

  }



  

  async getAllSectionEnrollments(sectionId: string): Promise<ApiResponse<Array<{ id: string; student: { id: string; studentCode: string; firstName: string; lastName: string }; status: string }>>> {
    return this.request(`/enrollments/section/${sectionId}/all`)
  }

  async getAllEnrollments(): Promise<ApiResponse<Array<{ id: string; studentId: string; sectionId: string; status: string; createdAt: string; student: { id: string; studentCode: string; firstName: string; lastName: string; email: string }; section: { id: string; code: string; course: { name: string; code: string }; professor: { firstName: string; lastName: string } } }>>> {
    return this.request('/enrollments/all')
  }

  async getStudentEnrollmentHistory(studentId: string): Promise<ApiResponse<Array<{ id: string; studentId: string; sectionId: string; status: string; createdAt: string; section: { id: string; code: string; course: { name: string; code: string }; professor: { firstName: string; lastName: string } } }>>> {
    return this.request(`/enrollments/student/${studentId}/history`)
  }

  async moveEnrollment(enrollmentId: string, newSectionId: string): Promise<ApiResponse<{ id: string; studentId: string; sectionId: string; status: string }>> {
    return this.request(`/enrollments/${enrollmentId}/move`, { method: 'PATCH', body: JSON.stringify({ newSectionId }) })
  }

  async deleteEnrollment(enrollmentId: string): Promise<ApiResponse<{ id: string; studentId: string; sectionId: string; status: string }>> {
    return this.request(`/enrollments/${enrollmentId}`, { method: 'DELETE' })
  }

async getAuditLogs(page?: number, limit?: number): Promise<ApiResponse<{ logs: AuditLog[]; total: number; page: number; limit: number }>> {

    const params = new URLSearchParams()

    if (page) params.append('page', page.toString())

    if (limit) params.append('limit', limit.toString())

    const query = params.toString() ? `?${params.toString()}` : ''

    return this.request(`/audit${query}`)

  }

  async updateEnrollment(id: string, status: string): Promise<ApiResponse<{ id: string; studentId: string; sectionId: string; status: string }>> {
    return this.request(`/enrollments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
  }



}



export const api = new ApiClient()

type EnrollmentStatus = 'ACTIVE' | 'INACTIVE' | 'DROPPED' | 'COMPLETED'


export type {

  EnrollmentStatus,

  Professor,

  Section,

  Session,

  AttendanceRecord,

  AttendanceStats,

  SectionRoster,
  RosterStudent,

  AttendanceReport,

  ReportAttendanceItem,

  SectionSummary,

  Course,

  QRGenerationResponse,

  Notification,

  AdminStats,

  User,

  StudentProfile,

  StudentAttendanceSummary,

  AuditLog,

}

with open('qr-attendance/src/lib/api/client.ts', 'r') as f:
    content = f.read()

old = '''async getAllSectionEnrollments(sectionId: string): Promise<ApiResponse<Array<{ id: string; student: { id: string; studentCode: string; firstName: string; lastName: string }; status: string }>>> {
    return this.request(`/enrollments/section/${sectionId}/all`)
  }

  async getStudentEnrollmentHistory'''

new = '''async getAllSectionEnrollments(sectionId: string): Promise<ApiResponse<Array<{ id: string; student: { id: string; studentCode: string; firstName: string; lastName: string }; status: string }>>> {
    return this.request(`/enrollments/section/${sectionId}/all`)
  }

  async getAllEnrollments(): Promise<ApiResponse<Array<{ id: string; studentId: string; sectionId: string; status: string; createdAt: string; student: { id: string; studentCode: string; firstName: string; lastName: string; email: string }; section: { id: string; code: string; course: { name: string; code: string }; professor: { firstName: string; lastName: string } } }>>> {
    return this.request('/enrollments/all')
  }

  async getStudentEnrollmentHistory'''

if old in content:
    content = content.replace(old, new)
    with open('qr-attendance/src/lib/api/client.ts', 'w') as f:
        f.write(content)
    print('Added getAllEnrollments')
else:
    print('Pattern not found')
with open('src/lib/api/client.ts', 'r', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n').replace('\r', '\n')

old = '''  async getSectionEnrollments(sectionId: string): Promise<ApiResponse<Array<{ id: string; student: { id: string; studentCode: string; firstName: string; lastName: string }; status: string }>>> {

    return this.request(`/enrollments/section/${sectionId}`)

  }


  async getAuditLogs'''

new = '''  async getSectionEnrollments(sectionId: string): Promise<ApiResponse<Array<{ id: string; student: { id: string; studentCode: string; firstName: string; lastName: string }; status: string }>>> {

    return this.request(`/enrollments/section/${sectionId}`)

  }

  async getAllSectionEnrollments(sectionId: string): Promise<ApiResponse<Array<{ id: string; student: { id: string; studentCode: string; firstName: string; lastName: string }; status: string }>>> {
    return this.request(`/enrollments/section/${sectionId}/all`)
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


  async getAuditLogs'''

if old in content:
    content = content.replace(old, new)
    with open('src/lib/api/client.ts', 'w', newline='\n') as f:
        f.write(content)
    print('Added new API methods')
else:
    print('Pattern not found')
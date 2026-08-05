with open('src/lib/api/client.ts', 'r', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n').replace('\r', '\n')

idx = content.find('async getSectionEnrollments')
if idx >= 0:
    # Find the end of this method (second closing brace)
    brace_count = 0
    end_idx = idx
    for i, ch in enumerate(content[idx:], idx):
        if ch == '{':
            brace_count += 1
        elif ch == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    
    # Find the next method start
    next_method = content.find('async getAuditLogs', end_idx)
    if next_method > 0:
        insert_pos = next_method
    else:
        insert_pos = end_idx
    
    new_methods = '''

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

'''
    content = content[:insert_pos] + new_methods + content[insert_pos:]
    with open('src/lib/api/client.ts', 'w', newline='\n') as f:
        f.write(content)
    print('Added new API methods at position', insert_pos)
else:
    print('Not found')
with open('src/lib/api/client.ts', 'r') as f:
    content = f.read()

# Find the getSectionEnrollments method and add updateEnrollment after it
idx = content.find('async getSectionEnrollments')
if idx >= 0:
    # Find the end of this method
    end_idx = content.find('  }', idx)
    end_idx = content.find('  }', end_idx + 3)
    print(f"Found at idx={idx}, end_idx={end_idx}")
    print(repr(content[idx:end_idx+30]))
    
    new_method = '''

  async updateEnrollment(id: string, status: string): Promise<ApiResponse<{ id: string; studentId: string; sectionId: string; status: string }>> {
    return this.request(`/enrollments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
  }

'''
    content = content[:end_idx+3] + new_method + content[end_idx+3:]
    with open('src/lib/api/client.ts', 'w') as f:
        f.write(content)
    print('Done!')
else:
    print('Not found')
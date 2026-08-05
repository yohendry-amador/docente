with open('src/lib/api/client.ts', 'r') as f:
    content = f.read()

# Find the exact position
idx = content.find('async createSection')
if idx >= 0:
    # Find the end of the createSection method (after the closing brace)
    end_idx = content.find('  }\n\n\n\n  async enrollStudent', idx)
    if end_idx == -1:
        end_idx = content.find('  }\n\n\n\n\n  async enrollStudent', idx)
    if end_idx == -1:
        # Try another variation
        end_idx = content.index('  }\n', content.index('  }\n', idx) + 3)
        # Skip the blank lines
        while content[end_idx:end_idx+2] == '\n\n':
            end_idx += 2
    print(f"Found at idx={idx}, end_idx={end_idx}")
    print(repr(content[idx:end_idx+30]))
    
    # Replace from end_idx
    new_methods = '''

  async updateSection(id: string, data: { code?: string; courseId?: string; professorId?: string; schedule?: string; room?: string; semester?: string; year?: number }): Promise<ApiResponse<Section>> {
    return this.request<Section>(`/sections/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteSection(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/sections/${id}`, { method: 'DELETE' })
  }

'''
    content = content[:end_idx] + new_methods + content[end_idx:]
    with open('src/lib/api/client.ts', 'w') as f:
        f.write(content)
    print('Done!')
else:
    print('Not found')
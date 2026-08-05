import re

with open('src/app/admin/sections/page.tsx', 'r', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n').replace('\r', '\n')

# Use regex to replace the button section
pattern = r'<td className="px-6 py-4 text-right">\s*<button\s+type="button"\s+onClick=\{\(\) => openSectionDetails\(section\)\}\s+className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"\s*>\s*<span className="material-symbols-outlined text-base">visibility</span>\s*Ver informacion\s*</button>\s*</td>'

new = '''<td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openSectionDetails(section)}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                        Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(section)}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                        title="Editar sección"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section.id, section.code)}
                        className="inline-flex items-center gap-2 rounded-lg border border-error px-3 py-2 text-xs font-semibold text-error transition hover:bg-error/5"
                        title="Eliminar sección"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>'''

content = re.sub(pattern, new, content)

with open('src/app/admin/sections/page.tsx', 'w', newline='\n') as f:
    f.write(content)
print('Replaced successfully')
import re

with open('src/app/admin/sections/page.tsx', 'r', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n').replace('\r', '\n')

pattern = r'showModal \&\& \(\s*<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">\s*<div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">\s*<h2 className="mb-4 text-xl font-bold text-on-surface">Nueva Sección</h2>\s*<form onSubmit=\{handleCreate\} className="space-y-4">'

new = '''showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">

            <h2 className="mb-4 text-xl font-bold text-on-surface">{isEditMode ? "Editar Sección" : "Nueva Sección"}</h2>

            <form onSubmit={isEditMode ? handleUpdate : handleCreate} className="space-y-4">'''

content = re.sub(pattern, new, content)

with open('src/app/admin/sections/page.tsx', 'w', newline='\n') as f:
    f.write(content)
print('Replaced successfully')
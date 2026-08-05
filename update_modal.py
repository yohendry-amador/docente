with open('src/app/admin/sections/page.tsx', 'r', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n').replace('\r', '\n')

old = """showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">

            <h2 className="mb-4 text-xl font-bold text-on-surface">Nueva Sección</h2>

            <form onSubmit={handleCreate} className="space-y-4">"""

new = """showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">

            <h2 className="mb-4 text-xl font-bold text-on-surface">{isEditMode ? "Editar Sección" : "Nueva Sección"}</h2>

            <form onSubmit={isEditMode ? handleUpdate : handleCreate} className="space-y-4">"""

if old in content:
    content = content.replace(old, new)
    with open('src/app/admin/sections/page.tsx', 'w', newline='\n') as f:
        f.write(content)
    print('Replaced successfully')
else:
    print('Pattern not found')
    idx = content.find('showModal &&')
    if idx >= 0:
        print(repr(content[idx:idx+300]))
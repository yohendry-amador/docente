with open('qr-attendance/src/app/admin/enrollments/page.tsx', 'r') as f:
    content = f.read()

old = 'onChange={(e) => { setFilterStatus(e.target.value as any); loadEnrollments(e.target.value || undefined) }}'
new = 'onChange={(e) => { const val = e.target.value; setFilterStatus(val as any); if (val !== "ALL") loadEnrollments(val); else setEnrollments([]); }}'

if old in content:
    content = content.replace(old, new)
    with open('qr-attendance/src/app/admin/enrollments/page.tsx', 'w') as f:
        f.write(content)
    print('Fixed')
else:
    print('Not found')
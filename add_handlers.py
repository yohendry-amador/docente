with open('src/app/admin/sections/page.tsx', 'r', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n').replace('\r', '\n')

old = """setIsLoading(false)

  }

  useEffect(() => {"""

new = """setIsLoading(false)

  }

  const openEditModal = (section: SectionWithDetails) => {
    setSelectedSection(section)
    setFormData({
      code: section.code,
      courseId: section.courseId,
      professorId: section.professorId,
      schedule: section.schedule,
      room: section.room,
      semester: section.semester,
      year: section.year,
    })
    setIsEditMode(true)
    setShowModal(true)
  }

  const handleDeleteSection = async (id: string, code: string) => {
    if (!confirm("Eliminar la seccion " + code + "? Esta accion no se puede deshacer.")) return
    try {
      await api.deleteSection(id)
      await loadData()
    } catch (err) {
      console.error("Error deleting section:", err)
      alert("Error al eliminar la seccion")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSection) return
    setIsSubmitting(true)
    try {
      await api.updateSection(selectedSection.id, formData)
      setShowModal(false)
      setIsEditMode(false)
      setFormData({ code: "", courseId: "", professorId: "", schedule: "", room: "", semester: "", year: new Date().getFullYear() })
      await loadData()
    } catch (err) { console.error("Error updating section:", err) }
    setIsSubmitting(false)
  }

  useEffect(() => {"""

if old in content:
    content = content.replace(old, new)
    with open('src/app/admin/sections/page.tsx', 'w', newline='\n') as f:
        f.write(content)
    print('Replaced successfully')
else:
    print('Pattern not found')
import { useCallback, useState } from 'react'

interface Props {
  onFile: (file: File) => void
}

export default function FileUpload({ onFile }: Props) {
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const pdf = Array.from(files).find(f => f.type === 'application/pdf')
      if (pdf) onFile(pdf)
    },
    [onFile]
  )

  return (
    <label
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      className={`flex flex-col items-center justify-center w-full max-w-lg mx-auto h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-colors
        ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-300 hover:bg-gray-50'}`}
    >
      <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="text-gray-600 font-medium">Drop a PDF here</p>
      <p className="text-gray-400 text-sm mt-1">or click to browse</p>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </label>
  )
}

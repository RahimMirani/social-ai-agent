"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { uploadKnowledgeBaseFile, deleteKnowledgeBaseFile } from "@/app/actions/agent-actions"
import { FileText, Upload, Loader2, Trash2, File } from "lucide-react"
import type { KnowledgeBaseFile } from "@/types"

interface KnowledgeBaseSectionProps {
  files: KnowledgeBaseFile[]
}

export function KnowledgeBaseSection({ files }: KnowledgeBaseSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const content = await file.text()
      await uploadKnowledgeBaseFile(file.name, content, file.type, file.size)
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (fileId: string) => {
    setDeletingId(fileId)
    try {
      await deleteKnowledgeBaseFile(fileId)
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Knowledge Base</h2>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1 text-foreground">Upload Files</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add documents, FAQs, or product information for your agent to reference
          </p>
          <Button asChild variant="outline" disabled={isUploading}>
            <label className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </Button>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Uploaded Files</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-foreground">{file.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingId === file.id}
                  >
                    {deletingId === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

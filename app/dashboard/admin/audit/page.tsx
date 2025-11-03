"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, User, Settings, Trash2, Flag } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface AuditLog {
  log_id: number
  admin_id: number
  admin_name: string
  admin_email: string
  action: string
  resource_type: string
  resource_id?: number
  details?: any // Changed from string to any to handle both string and object
  ip_address: string
  created_at: string // Changed from timestamp to created_at to match database column
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [searchQuery, logs])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ logs: AuditLog[] }>("/api/admin/audit-logs")
      setLogs(response.logs)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    if (!searchQuery) {
      setFilteredLogs(logs)
      return
    }

    const filtered = logs.filter(
      (log) =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredLogs(filtered)
  }

  const getActionIcon = (action: string) => {
    if (action.includes("delete")) return <Trash2 className="h-4 w-4" />
    if (action.includes("ban") || action.includes("flag")) return <Flag className="h-4 w-4" />
    if (action.includes("settings")) return <Settings className="h-4 w-4" />
    if (action.includes("user")) return <User className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  const getActionBadge = (action: string) => {
    if (action.includes("delete")) return <Badge variant="destructive">{action}</Badge>
    if (action.includes("create")) return <Badge variant="default">{action}</Badge>
    if (action.includes("update")) return <Badge variant="secondary">{action}</Badge>
    return <Badge variant="outline">{action}</Badge>
  }

  const renderDetails = (details: any) => {
    if (!details) return null

    // If it's already a string, return it
    if (typeof details === "string") {
      try {
        // Try to parse if it's a JSON string
        const parsed = JSON.parse(details)
        return JSON.stringify(parsed, null, 2)
      } catch {
        // If parsing fails, it's a regular string
        return details
      }
    }

    // If it's an object, stringify it
    if (typeof details === "object") {
      return JSON.stringify(details, null, 2)
    }

    // Fallback to string conversion
    return String(details)
  }

  const formatTimestamp = (timestamp: string | null | undefined): string => {
    if (!timestamp) return "Unknown date"

    try {
      const date = new Date(timestamp)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }
      return date.toLocaleString()
    } catch (error) {
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Track all administrative actions on the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Activity Log</CardTitle>
          <CardDescription>Complete history of admin actions and changes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, admin, or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <Card key={log.log_id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 w-full space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getActionBadge(log.action)}
                          <span className="text-sm text-muted-foreground">on</span>
                          <Badge variant="outline">{log.resource_type}</Badge>
                          {log.resource_id && (
                            <>
                              <span className="text-sm text-muted-foreground">ID:</span>
                              <span className="text-sm font-mono break-all">{log.resource_id}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm break-words">
                          <span className="font-medium">{log.admin_name}</span>
                          <span className="text-muted-foreground"> ({log.admin_email})</span>
                        </p>
                        {log.details && (
                          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {renderDetails(log.details)}
                          </pre>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="break-all">{formatTimestamp(log.created_at)}</span>
                          <span>•</span>
                          <span className="break-all">IP: {log.ip_address}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Send, Users, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailTemplate {
  id: string
  name: string
  description: string
  category: "welcome" | "notification" | "marketing" | "transactional"
  subject: string
  preview: string
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome-homeowner",
    name: "Welcome Email - Homeowner",
    description: "Sent when a new homeowner signs up",
    category: "welcome",
    subject: "Welcome to HomeHero!",
    preview: "Welcome to HomeHero! We're excited to help you find the perfect contractor...",
  },
  {
    id: "welcome-contractor",
    name: "Welcome Email - Contractor",
    description: "Sent when a new contractor signs up",
    category: "welcome",
    subject: "Welcome to HomeHero - Start Bidding Today!",
    preview: "Welcome to HomeHero! Start browsing jobs and submitting bids...",
  },
  {
    id: "job-posted",
    name: "New Job Posted",
    description: "Notify contractors of new jobs in their area",
    category: "notification",
    subject: "New Job Posted in Your Area",
    preview: "A new job matching your skills has been posted...",
  },
  {
    id: "bid-received",
    name: "Bid Received",
    description: "Notify homeowner when their job receives a bid",
    category: "notification",
    subject: "You've Received a New Bid!",
    preview: "Great news! A contractor has submitted a bid on your job...",
  },
  {
    id: "job-accepted",
    name: "Job Accepted",
    description: "Notify contractor when their bid is accepted",
    category: "notification",
    subject: "Congratulations! Your Bid Was Accepted",
    preview: "Your bid has been accepted! Here's what happens next...",
  },
  {
    id: "job-completed",
    name: "Job Completed",
    description: "Request review after job completion",
    category: "transactional",
    subject: "How Was Your Experience?",
    preview: "We hope your project went well! Please take a moment to review...",
  },
  {
    id: "verification-reminder",
    name: "Verification Reminder",
    description: "Remind contractors to complete verification",
    category: "transactional",
    subject: "Complete Your Profile Verification",
    preview: "Get more jobs by completing your profile verification...",
  },
  {
    id: "inactive-user",
    name: "Re-engagement Campaign",
    description: "Re-engage inactive users",
    category: "marketing",
    subject: "We Miss You! Come Back to HomeHero",
    preview: "It's been a while since we've seen you. Here's what's new...",
  },
  {
    id: "newsletter",
    name: "Monthly Newsletter",
    description: "Monthly platform updates and tips",
    category: "marketing",
    subject: "HomeHero Monthly Newsletter",
    preview: "This month's platform updates, success stories, and tips...",
  },
  {
    id: "seasonal-promo",
    name: "Seasonal Promotion",
    description: "Seasonal campaigns and promotions",
    category: "marketing",
    subject: "Spring Home Improvement Season is Here!",
    preview: "Get ready for spring with these home improvement ideas...",
  },
]

export default function AdminEmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const { toast } = useToast()

  const filteredTemplates =
    categoryFilter === "all" ? emailTemplates : emailTemplates.filter((t) => t.category === categoryFilter)

  const handleSendTest = (template: EmailTemplate) => {
    toast({
      title: "Test Email Sent",
      description: `Test email for "${template.name}" sent to your email`,
    })
  }

  const handleCreateCampaign = (template: EmailTemplate) => {
    toast({
      title: "Coming Soon",
      description: "Email campaign creation will be available once MailerSend is integrated",
    })
  }

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      welcome: "default",
      notification: "secondary",
      marketing: "outline",
      transactional: "destructive",
    }
    return <Badge variant={variants[category] || "default"}>{category}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Campaigns</h1>
        <p className="text-muted-foreground">
          Manage email templates and campaigns (MailerSend integration coming soon)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailTemplates.length}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Awaiting MailerSend setup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No campaigns sent yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">No data yet</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Pre-configured email templates for various campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="welcome">Welcome</TabsTrigger>
              <TabsTrigger value="notification">Notifications</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="transactional">Transactional</TabsTrigger>
            </TabsList>

            <TabsContent value={categoryFilter} className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm">{template.description}</CardDescription>
                        </div>
                        {getCategoryBadge(template.category)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Subject:</p>
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Preview:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{template.preview}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleSendTest(template)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Test
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCreateCampaign(template)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Create Campaign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">MailerSend Integration Required</h3>
              <p className="text-sm text-muted-foreground">
                To send email campaigns, you'll need to integrate MailerSend. Once configured, you'll be able to create
                campaigns, schedule sends, and track performance metrics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

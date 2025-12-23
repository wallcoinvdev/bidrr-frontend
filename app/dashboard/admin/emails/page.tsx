"use client"

import { useState } from "react"
import { Mail, Send, Plus, Users, BarChart3 } from "lucide-react"
import { usePageTitle } from "@/hooks/use-page-title"

const EMAIL_TEMPLATES = [
  {
    id: 1,
    name: "Welcome Email - Customer",
    category: "welcome",
    subject: "Welcome to Bidrr!",
    preview: "Welcome to Bidrr! We're excited to help you find the perfect contractor...",
    description: "Sent when a new customer signs up",
  },
  {
    id: 2,
    name: "Welcome Email - Contractor",
    category: "welcome",
    subject: "Welcome to Bidrr - Start Bidding Today!",
    preview: "Welcome to Bidrr! Start browsing jobs and submitting bids...",
    description: "Sent when a new contractor signs up",
  },
  {
    id: 3,
    name: "New Job Posted",
    category: "notification",
    subject: "New Job Posted in Your Area",
    preview: "A new job matching your skills has been posted...",
    description: "Notify contractors of new jobs in their area",
  },
  {
    id: 4,
    name: "Bid Received",
    category: "notification",
    subject: "You've Received a New Bid!",
    preview: "Great news! A contractor has submitted a bid on your job...",
    description: "Notify customer when their job receives a bid",
  },
  {
    id: 5,
    name: "Job Accepted",
    category: "notification",
    subject: "Congratulations! Your Bid Was Accepted",
    preview: "Your bid has been accepted! Here's what happens next...",
    description: "Notify contractor when their bid is accepted",
  },
  {
    id: 6,
    name: "Job Completed",
    category: "transactional",
    subject: "How Was Your Experience?",
    preview: "We hope your project went well! Please take a moment to review...",
    description: "Request review after job completion",
  },
  {
    id: 7,
    name: "Verification Reminder",
    category: "transactional",
    subject: "Complete Your Profile Verification",
    preview: "Get more jobs by completing your profile verification...",
    description: "Remind contractors to complete verification",
  },
  {
    id: 8,
    name: "Re-engagement Campaign",
    category: "marketing",
    subject: "We Miss You! Come Back to Bidrr",
    preview: "It's been a while since we've seen you. Here's what's new...",
    description: "Re-engage inactive users",
  },
  {
    id: 9,
    name: "Monthly Newsletter",
    category: "marketing",
    subject: "Bidrr Monthly Newsletter",
    preview: "This month's platform updates, success stories, and tips...",
    description: "Monthly platform updates and tips",
  },
  {
    id: 10,
    name: "Seasonal Promotion",
    category: "marketing",
    subject: "Spring Home Improvement Season is Here!",
    preview: "Get ready for spring with these home improvement ideas...",
    description: "Seasonal campaigns and promotions",
  },
]

export default function EmailCampaignsPage() {
  usePageTitle("Email Campaigns")

  const [activeTab, setActiveTab] = useState("all")

  const filteredTemplates =
    activeTab === "all" ? EMAIL_TEMPLATES : EMAIL_TEMPLATES.filter((t) => t.category === activeTab)

  const getCategoryBadge = (category: string) => {
    const colors = {
      welcome: "bg-black text-white",
      notification: "bg-gray-100 text-gray-800",
      transactional: "bg-red-100 text-red-800",
      marketing: "bg-white text-gray-800 border border-gray-300",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
        <p className="text-gray-600 mt-2">Manage email templates and campaigns (MailerSend integration coming soon)</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Templates</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">10</p>
          <p className="text-xs text-gray-500">Ready to use</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Send className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Campaigns Sent</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">0</p>
          <p className="text-xs text-gray-500">No active MailerSend setup</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Recipients</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">0</p>
          <p className="text-xs text-gray-500">No campaigns sent yet</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Open Rate</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">--</p>
          <p className="text-xs text-gray-500">Not yet</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Email Templates</h2>
          <p className="text-sm text-gray-600">Pre-configured email templates for various campaigns</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {["all", "welcome", "notification", "marketing", "transactional"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab ? "border-b-2 border-[#0F3D3E] text-[#0F3D3E]" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "all" ? "All Templates" : tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <span className={`text-xs px-2 py-1 rounded font-medium ${getCategoryBadge(template.category)}`}>
                  {template.category}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{template.description}</p>

              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Subject:</span>
                </p>
                <p className="text-sm text-gray-900">{template.subject}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Preview:</span>
                </p>
                <p className="text-sm text-gray-600">{template.preview}</p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Test
                </button>
                <button className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Campaign
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">MailerSend Integration Required</p>
            <p className="text-sm text-blue-800">
              To send real campaigns, you'll need to integrate MailerSend. Once configured, you'll be able to create
              campaigns, schedule sends, and track performance metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

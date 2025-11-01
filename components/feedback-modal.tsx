"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export function FeedbackModal() {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const fullMessage = `${subject.trim()}\n\n${message.trim()}`

      await apiClient.request("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          message: fullMessage,
        }),
        requiresAuth: true,
      })

      setShowSuccess(true)
      setSubject("")
      setMessage("")

      setTimeout(() => {
        setShowSuccess(false)
        setOpen(false)
        toast({
          title: "Thank you for your feedback!",
          description: "Your feedback has been sent to our team. We appreciate you helping us improve HomeHero.",
          duration: 5000,
        })
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Error submitting feedback:", error)
      toast({
        title: "Unable to send feedback",
        description: "There was a problem submitting your feedback. Please try again later.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 bg-transparent"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <DialogTitle className="text-center text-xl">Feedback Sent!</DialogTitle>
            <DialogDescription className="text-center text-base">
              Your feedback is appreciated and helps us provide you with the best possible service.
            </DialogDescription>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Send Feedback</DialogTitle>
              <DialogDescription>
                Have a suggestion or found an issue? Let us know! Your feedback helps us improve HomeHero.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your feedback"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500">{message.length}/2000 characters</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#328d87] hover:bg-[#2a7670]">
                {isSubmitting ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

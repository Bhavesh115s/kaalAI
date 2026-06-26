"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

export interface SavedChat {
  id: string
  title: string
  preview: string
  timestamp: string
  session_id?: string
}

interface UseSavedChatsReturn {
  savedChats: SavedChat[]
  loading: boolean
  error: string | null
  saveChat: (chatData: Partial<SavedChat>) => Promise<SavedChat | null>
  deleteChat: (sessionId: string) => Promise<boolean>
}

export function useSavedChats(): UseSavedChatsReturn {
  const { user } = useAuth()

  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.kaalai.in"

  const API_KEY =
    process.env.NEXT_PUBLIC_API_KEY || ""

  /* ================= LOAD CHATS ================= */

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `${BASE_URL}/api/saved-chats/${user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": API_KEY,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        if (data?.success && Array.isArray(data.chats)) {
          const formatted: SavedChat[] = data.chats.map((item: any) => ({
            id: item.session_id || item.id || item._id,
            session_id: item.session_id || item.id || item._id,
            title: item.title || "Conversation",
            preview:
              item.preview ||
              item.last_message ||
              item.lastMessage ||
              "",
            timestamp:
              item.timestamp ||
              item.updated_at ||
              item.createdAt ||
              new Date().toISOString(),
          }))

          setSavedChats(formatted)
        } else {
          setSavedChats([])
        }
      } catch (err) {
        console.error("[SavedChats]", err)
        setSavedChats([])
        setError("Failed to load chats")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user?.id])

  /* ================= SAVE CHAT ================= */

  const saveChat = useCallback(
    async (chatData: Partial<SavedChat>): Promise<SavedChat | null> => {
      if (!user?.id) return null

      try {
        const payload = {
          ...chatData,
          user_id: user.id,
          timestamp: chatData.timestamp || new Date().toISOString(),
        }

        const response = await fetch(
          `${BASE_URL}/api/save-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": API_KEY,
            },
            body: JSON.stringify(payload),
          }
        )

        if (!response.ok) {
          throw new Error("Failed to save")
        }

        const data = await response.json()

        const newChat: SavedChat = {
          id:
            data.chat?.session_id ||
            data.session_id ||
            crypto.randomUUID(),
          session_id:
            data.chat?.session_id ||
            data.session_id,
          title: chatData.title || "Conversation",
          preview: chatData.preview || "",
          timestamp: payload.timestamp,
        }

        setSavedChats(prev => [newChat, ...prev])

        return newChat
      } catch (err) {
        console.error(err)
        return null
      }
    },
    [user?.id]
  )

  /* ================= DELETE CHAT ================= */

  const deleteChat = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/delete-chat/${sessionId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": API_KEY,
            },
          }
        )

        if (!response.ok) {
          throw new Error("Delete failed")
        }

        setSavedChats(prev =>
          prev.filter(
            c =>
              c.id !== sessionId &&
              c.session_id !== sessionId
          )
        )

        return true
      } catch (err) {
        console.error(err)
        return false
      }
    },
    []
  )

  return {
    savedChats,
    loading,
    error,
    saveChat,
    deleteChat,
  }
}
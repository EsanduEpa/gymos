"use client"

import { useState, useEffect } from "react"
import { Search, Send, User, MessageSquare } from "lucide-react"
import { getConversation, sendMessage } from "@/app/actions/messages"

interface MessagesClientProps {
  initialClients: any[]
  currentUserId: string
}

export default function MessagesClient({ initialClients, currentUserId }: MessagesClientProps) {
  const [clients, setClients] = useState(initialClients)
  const [selectedClient, setSelectedClient] = useState<any>(initialClients[0] || null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [sending, setSending] = useState(false)

  // Fetch messages when selected client changes
  useEffect(() => {
    if (selectedClient) {
      getConversation(selectedClient.id).then(setMessages)
    }
  }, [selectedClient])

  // Polling every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedClient) {
        getConversation(selectedClient.id).then(setMessages)
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [selectedClient])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient || !inputText.trim() || sending) return

    const content = inputText
    setInputText("")
    setSending(true)

    try {
      const newMsg = await sendMessage(selectedClient.id, content)
      setMessages((prev) => [...prev, newMsg])
    } finally {
      setSending(false)
    }
  }

  const filteredClients = clients.filter((c) =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Left Panel: Client Thread List */}
      <div className="w-full md:w-80 border-r border-[#E1E1E4] flex flex-col bg-[#F8F9FA]">
        <div className="p-4 border-b border-[#E1E1E4]">
          <h1 className="text-base font-bold text-[#171B28]">Client Messages</h1>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8B8E98]" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E1E1E4] rounded-lg text-xs text-[#171B28] focus:outline-none focus:border-[#007A35]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E1E1E4]">
          {filteredClients.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8B8E98]">No clients found.</div>
          ) : (
            filteredClients.map((client) => {
              const isSelected = selectedClient?.id === client.id

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-white border-l-4 border-l-[#007A35]" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-[#007A35] font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {client.fullName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${client.unreadCount > 0 ? "font-bold" : "font-semibold"} text-[#171B28] truncate`}>
                        {client.fullName}
                      </p>
                      {client.unreadCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-[#007A35]"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8B8E98] truncate mt-0.5">{client.lastMessage}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Panel: Active Conversation */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedClient ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#E1E1E4] flex items-center gap-3 bg-white">
              <div className="h-9 w-9 rounded-full bg-emerald-100 text-[#007A35] font-bold flex items-center justify-center text-xs">
                {selectedClient.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#171B28]">{selectedClient.fullName}</h2>
                <p className="text-[10px] text-[#8B8E98]">{selectedClient.email}</p>
              </div>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F4F5F7]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-[#8B8E98]">
                  <MessageSquare className="h-8 w-8 text-[#8B8E98]/40 mb-2" />
                  <p>No message history yet. Send a message to start!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUserId

                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-sm ${
                          isMe ? "bg-[#007A35] text-white rounded-br-none" : "bg-white text-[#171B28] border border-[#E1E1E4] rounded-bl-none"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-[9px] mt-1 text-right ${isMe ? "text-emerald-100" : "text-[#8B8E98]"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#E1E1E4] flex items-center gap-2 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#F8F9FA] border border-[#E1E1E4] rounded-xl text-xs text-[#171B28] focus:outline-none focus:border-[#007A35]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-2.5 bg-[#007A35] text-white rounded-xl hover:bg-[#00632B] disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[#8B8E98]">
            Select a client conversation to begin messaging.
          </div>
        )}
      </div>
    </div>
  )
}

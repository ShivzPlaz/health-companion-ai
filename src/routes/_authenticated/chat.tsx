import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Mic,
  Paperclip,
  Plus,
  Send,
  Settings,
  Stethoscope,
  Camera,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Phone,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { useTranslation } from "react-i18next";

type ChatMessageResponse = {
  id: number;
  role: "assistant" | "user" | "system";
  content: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string } & { isFinal?: boolean }>>;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "Consultation Chat — NexCure AI" },
      {
        name: "description",
        content: "Chat with our AI healthcare assistant for preliminary guidance.",
      },
    ],
  }),
  component: ChatPage,
});

type Msg = {
  id: string;
  role: "ai" | "user" | "system";
  text: string;
  time: string;
  image?: string;
};
type Chat = { id: number; title: string };

function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const { t } = useTranslation();

  // Initialize and fetch chats
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate({ to: "/login" });
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
        if (data.length > 0) {
          loadChat(data[0].id);
        } else {
          startNewChat();
        }
      } else if (res.status === 401) {
        navigate({ to: "/login" });
      }
    } catch (e) {
      toast.error(t("chat.load_error"));
    }
  };

  const startNewChat = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats((prev) => [...prev, data]);
        setCurrentChatId(data.id);
        setMessages([
          {
            id: "init",
            role: "ai",
            text: "Hi! I'm NexCure. Tell me what's going on — your symptoms, when they started, and how severe they feel.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        toast.success(t("chat.new_consultation"));
      }
    } catch (e) {
      toast.error(t("chat.create_error"));
    }
  };

  const loadChat = async (id: number) => {
    setCurrentChatId(id);
    setMessages([]);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/chats/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as ChatMessageResponse[];
        const loadedMsgs: Msg[] = data.map((m: any) => ({
          id: m.id.toString(),
          role: m.role === "assistant" ? "ai" : "user",
          text: m.content,
          time: "Previous",
        }));
        if (loadedMsgs.length === 0) {
          loadedMsgs.push({
            id: "init",
            role: "ai",
            text: "Hi! I'm NexCure. Tell me what's going on — your symptoms, when they started, and how severe they feel.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        }
        setMessages(loadedMsgs);
      }
    } catch (e) {
      toast.error(t("chat.msg_error"));
    }
  };

  // Keep scroll at bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleNewChat = () => startNewChat();
    window.addEventListener("new-chat", handleNewChat);
    return () => window.removeEventListener("new-chat", handleNewChat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t("chat.speech_unsupported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    const startInput = input;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result[0]?.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setInput((startInput ? startInput + " " : "") + finalTranscript + interimTranscript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const send = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value && !attachedImage) return;
    if (!currentChatId) {
      toast.error(t("chat.no_chat"));
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const imgToSend = attachedImage;
    const newUserMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      text: value,
      time: now,
      image: imgToSend || undefined,
    };

    setMessages((m) => [...m, newUserMsg]);
    setInput("");
    setAttachedImage(null);
    setIsTyping(true);

    const isEmergency = /chest pain|can'?t breathe|stroke|unconscious|severe bleeding/i.test(value);
    setEmergency(isEmergency);

    if (isEmergency) {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "ai",
            text: t("chat.emergency_ai"),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsTyping(false);
      }, 1100);
      return;
    }

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: value,
          images: imgToSend ? [imgToSend] : undefined,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) navigate({ to: "/login" });
        throw new Error("Backend returned an error");
      }

      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      // Refresh chat list to update title if it's the first message
      if (messages.length <= 1) {
        fetchChats();
      }
    } catch (err) {
      console.error(err);
      toast.error(t("chat.backend_error"));
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: t("chat.backend_ai"),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar for chat history (Desktop only for simplicity here, but can adapt) */}
      <div className="hidden w-64 border-r border-border/60 bg-muted/20 sm:block">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="font-semibold text-sm">{t("chat.conversations")}</h2>
          <Button variant="ghost" size="icon" onClick={startNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="flex flex-col gap-1 p-2">
            {chats.map((c) => (
              <Button
                key={c.id}
                variant={currentChatId === c.id ? "secondary" : "ghost"}
                className="justify-start text-xs font-normal h-8"
                onClick={() => loadChat(c.id)}
              >
                <MessageSquare className="mr-2 h-3 w-3 shrink-0" />
                <span className="truncate">{c.title}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col relative overflow-hidden">
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-sm font-semibold">
              {chats.find((c) => c.id === currentChatId)?.title || t("chat.title")}
            </h1>
            <p className="text-xs text-muted-foreground">{t("chat.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden rounded-full sm:inline-flex">
              <Sparkles className="mr-1 h-3 w-3" /> Pro
            </Badge>
            <ThemeToggle />
          </div>
        </header>

        <AnimatePresence>
          {emergency && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="border-b border-destructive/30 bg-destructive/10"
            >
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">
                      {t("chat.emergency_title")}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("chat.emergency_desc")}</p>
                  </div>
                </div>
                <Button variant="destructive" size="sm">
                  <Phone className="mr-1.5 h-4 w-4" /> 911
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ScrollArea className="flex-1" ref={scrollRef as never}>
          <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 pb-32">
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {isTyping && <TypingBubble />}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border/60 bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
            <div className="flex flex-wrap gap-2 pb-3">
              {["Headache", "Fever", "Cough", "Stomach pain"].map((q) => (
                <button
                  key={q}
                  onClick={() => send(`I have a ${q.toLowerCase()}`)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:bg-accent/50"
                >
                  {q}
                </button>
              ))}
            </div>
            {attachedImage && (
              <div className="relative mb-2 inline-block">
                <img
                  src={attachedImage}
                  alt="Preview"
                  className="h-16 w-16 rounded-md object-cover border border-border"
                />
                <button
                  onClick={() => setAttachedImage(null)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white shadow-sm hover:bg-destructive/90"
                >
                  ✕
                </button>
              </div>
            )}
            <Card className="flex items-end gap-2 border-border/60 p-2 shadow-card">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Attach file">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="mb-2 w-48">
                  <DropdownMenuItem
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <span>{t("chat.upload_image")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer hidden sm:flex"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    <span>{t("chat.take_photo")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.info(t("chat.doc_soon"))}
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{t("chat.upload_doc")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={isListening ? t("chat.listening") : t("chat.placeholder")}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Voice"
                onClick={toggleListening}
                className={isListening ? "text-destructive animate-pulse" : ""}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => send()}
                size="icon"
                className="bg-gradient-hero text-primary-foreground hover:opacity-95"
              >
                <Send className="h-4 w-4" />
              </Button>
            </Card>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {t("chat.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const { t } = useTranslation();
  const isAi = msg.role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isAi ? "" : "flex-row-reverse"}`}
    >
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${isAi ? "bg-gradient-hero text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
      >
        {isAi ? (
          <Bot className="h-4 w-4" />
        ) : (
          <span className="text-xs font-semibold">{t("chat.you")}</span>
        )}
      </div>
      <div className={`max-w-[78%] ${isAi ? "" : "items-end"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isAi ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}
        >
          {msg.image && (
            <img
              src={msg.image}
              alt="Attached"
              className="mb-2 max-h-48 rounded-md object-cover border border-border/30"
            />
          )}
          {msg.text}
        </div>
        <p className={`mt-1 text-[11px] text-muted-foreground ${isAi ? "" : "text-right"}`}>
          {msg.time}
        </p>
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-hero text-primary-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
        <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
        <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
        <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}

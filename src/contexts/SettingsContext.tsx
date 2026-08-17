import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./AuthContext"
import es from "../i18n/es.json"
import en from "../i18n/en.json"

type Language = "es" | "en"

interface SettingsContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  logoUrl: string | null
  setLogoUrl: (url: string | null) => Promise<void>
  t: (key: string) => string
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const translations = { es, en }

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [language, setLanguageState] = useState<Language>("es")
  const [logoUrl, setLogoUrlState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSettings()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("language, logo_url")
        .eq("user_id", user!.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading settings:", error)
      } else if (data) {
        setLanguageState((data.language as Language) || "es")
        setLogoUrlState(data.logo_url || null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    if (!user) return

    await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, language: lang, updated_at: new Date().toISOString() })
  }

  const setLogoUrl = async (url: string | null) => {
    setLogoUrlState(url)
    if (!user) return

    await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, logo_url: url, updated_at: new Date().toISOString() })
  }

  const t = (key: string): string => {
    const dictionary = translations[language] as Record<string, string>
    return dictionary[key] || key
  }

  return (
    <SettingsContext.Provider value={{ language, setLanguage, logoUrl, setLogoUrl, t, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

import { useState, useEffect } from 'react'

interface QuranStructure {
  totalAyahs: number
  totalJuz: number
  totalHizb: number
  totalQuarters: number
}

interface Hizb {
  hizbNumber: number
  quarterCount: number
  ayahCount: number
  surahs: Array<{ surah: number; surahName: string }>
}

interface Quarter {
  quarterNumber: number
  ayahCount: number
  surahs: Array<{ surah: number; surahName: string }>
  range: {
    start: { surah: number; surahName: string; ayah: number }
    end: { surah: number; surahName: string; ayah: number }
  }
}

interface Ayah {
  id: string
  surah: number
  surahName: string
  surahNameEnglish?: string
  ayah: number
  text: string
  translation?: string
  juz: number
  hizb: number
  quarter: number
  page?: number
  ruku?: number
  sajda?: boolean
}

interface QuranContentResponse {
  structure?: QuranStructure
  juz?: number
  hizb?: number
  quarter?: number
  hizbs?: Hizb[]
  quarters?: Quarter[]
  ayahs?: Ayah[]
  ayahCount?: number
}

export function useQuranContent(juz?: number, hizb?: number, quarter?: number) {
  const [data, setData] = useState<QuranContentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (juz) params.append('juz', juz.toString())
      if (hizb) params.append('hizb', hizb.toString())
      if (quarter) params.append('quarter', quarter.toString())

      const response = await fetch(`/api/admin/content/quran?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || 'Failed to fetch Quran content')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching Quran content:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [juz, hizb, quarter])

  return {
    data,
    loading,
    error,
    refetch: fetchContent
  }
}
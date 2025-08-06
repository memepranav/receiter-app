'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  FileText,
  Users,
  Hash,
  ArrowLeft
} from 'lucide-react'
import { useQuranContent } from '@/hooks/useQuranContent'

export default function ContentPage() {
  const [selectedJuz, setSelectedJuz] = useState<number | undefined>()
  const [selectedHizb, setSelectedHizb] = useState<number | undefined>()
  const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>()

  // Fetch content based on current selection
  const { data, loading, error } = useQuranContent(selectedJuz, selectedHizb, selectedQuarter)

  // Navigation functions
  const handleJuzSelect = (juzNumber: number) => {
    setSelectedJuz(juzNumber)
    setSelectedHizb(undefined)
    setSelectedQuarter(undefined)
  }

  const handleHizbSelect = (hizbNumber: number) => {
    setSelectedHizb(hizbNumber)
    setSelectedQuarter(undefined)
  }

  const handleQuarterSelect = (quarterNumber: number) => {
    setSelectedQuarter(quarterNumber)
  }

  const handleBack = () => {
    if (selectedQuarter) {
      setSelectedQuarter(undefined)
    } else if (selectedHizb) {
      setSelectedHizb(undefined)
    } else if (selectedJuz) {
      setSelectedJuz(undefined)
    }
  }

  // Breadcrumb component
  const Breadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
      <button 
        onClick={() => { setSelectedJuz(undefined); setSelectedHizb(undefined); setSelectedQuarter(undefined) }}
        className="hover:text-slate-800 font-medium"
      >
        Quran Content
      </button>
      {selectedJuz && (
        <>
          <ChevronRight className="h-4 w-4" />
          <button 
            onClick={() => { setSelectedHizb(undefined); setSelectedQuarter(undefined) }}
            className="hover:text-slate-800"
          >
            Juz {selectedJuz}
          </button>
        </>
      )}
      {selectedHizb && (
        <>
          <ChevronRight className="h-4 w-4" />
          <button 
            onClick={() => setSelectedQuarter(undefined)}
            className="hover:text-slate-800"
          >
            Hizb {selectedHizb}
          </button>
        </>
      )}
      {selectedQuarter && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-800 font-medium">Quarter {selectedQuarter}</span>
        </>
      )}
    </div>
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-slate-600">Loading content...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Content Management</h1>
            <p className="text-sm text-slate-600">Browse and manage Quran content structure</p>
          </div>
          {(selectedJuz || selectedHizb || selectedQuarter) && (
            <Button 
              onClick={handleBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Overview Stats (when no selection) */}
        {!selectedJuz && data?.structure && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{data.structure.totalJuz}</p>
                  <p className="text-sm text-slate-600">Total Juz</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Hash className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{data.structure.totalHizb}</p>
                  <p className="text-sm text-slate-600">Total Hizb</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{data.structure.totalQuarters}</p>
                  <p className="text-sm text-slate-600">Total Quarters</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{data.structure.totalAyahs.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Total Ayahs</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Juz Selection (Level 1) */}
        {!selectedJuz && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Juz (1-30)</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => (
                <button
                  key={juzNumber}
                  onClick={() => handleJuzSelect(juzNumber)}
                  className="p-4 border-2 border-slate-200 rounded-lg text-center hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-primary">
                    {juzNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Juz</div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Hizb Selection (Level 2) */}
        {selectedJuz && !selectedHizb && data?.hizbs && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Select Hizb in Juz {selectedJuz}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.hizbs.map((hizb) => (
                <button
                  key={hizb.hizbNumber}
                  onClick={() => handleHizbSelect(hizb.hizbNumber)}
                  className="p-4 border border-slate-200 rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 group-hover:text-primary">
                      Hizb {hizb.hizbNumber}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                  </div>
                  <div className="text-sm text-slate-600">
                    {hizb.quarterCount} Quarters • {hizb.ayahCount} Ayahs
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {hizb.surahs.slice(0, 2).map(s => s.surahName).join(', ')}
                    {hizb.surahs.length > 2 && ` +${hizb.surahs.length - 2} more`}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Quarter Selection (Level 3) */}
        {selectedJuz && selectedHizb && !selectedQuarter && data?.quarters && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Select Quarter in Hizb {selectedHizb}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.quarters.map((quarter) => (
                <button
                  key={quarter.quarterNumber}
                  onClick={() => handleQuarterSelect(quarter.quarterNumber)}
                  className="p-4 border border-slate-200 rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 group-hover:text-primary">
                      Quarter {quarter.quarterNumber}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                  </div>
                  <div className="text-sm text-slate-600 mb-2">
                    {quarter.ayahCount} Ayahs
                  </div>
                  <div className="text-xs text-slate-500">
                    <div>From: {quarter.range.start.surahName} {quarter.range.start.ayah}</div>
                    <div>To: {quarter.range.end.surahName} {quarter.range.end.ayah}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Ayahs Display (Level 4) */}
        {selectedJuz && selectedHizb && selectedQuarter && data?.ayahs && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Ayahs in Quarter {selectedQuarter}
              </h3>
              <Badge variant="outline" className="text-sm">
                {data.ayahCount} Ayahs
              </Badge>
            </div>
            
            <div className="space-y-4">
              {data.ayahs.map((ayah, index) => (
                <div
                  key={ayah.id}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {ayah.surah}:{ayah.ayah}
                      </Badge>
                      <span className="text-sm font-medium text-slate-700">
                        {ayah.surahName}
                      </span>
                      {ayah.sajda && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Sajda
                        </Badge>
                      )}
                    </div>
                    {ayah.page && (
                      <span className="text-xs text-slate-500">
                        Page {ayah.page}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-right mb-3 leading-loose text-lg" dir="rtl">
                    {ayah.text}
                  </div>
                  
                  {ayah.translation && (
                    <div className="text-sm text-slate-600 italic">
                      {ayah.translation}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>Ayah #{index + 1}</span>
                    <span>Juz {ayah.juz} • Hizb {ayah.hizb} • Quarter {ayah.quarter}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
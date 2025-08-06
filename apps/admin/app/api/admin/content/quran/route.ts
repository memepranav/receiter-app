import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    const db = await getDatabase()
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const juzNumber = searchParams.get('juz')
    const hizbNumber = searchParams.get('hizb')
    const quarterNumber = searchParams.get('quarter')

    // If no parameters, return the structure overview
    if (!juzNumber && !hizbNumber && !quarterNumber) {
      // Get overview stats
      const stats = await Promise.all([
        // Total ayahs
        db.collection('quran_ayahs').countDocuments({}),
        // Total juz (should be 30)
        db.collection('quran_ayahs').distinct('juz_number').then(juz => juz.length),
        // Total hizb (should be 60) 
        db.collection('quran_ayahs').distinct('hizb_number').then(hizb => hizb.length),
        // Get total hizb combinations for proper quarter calculation
        db.collection('quran_ayahs').aggregate([
          {
            $group: {
              _id: { juz: '$juz_number', hizb: '$hizb_number' }
            }
          },
          { $count: 'total' }
        ]).toArray()
      ])

      // Each Hizb has 4 quarters (Rubʿ al-Hizb), so multiply by 4
      const totalHizbCombinations = stats[3][0]?.total || 0
      const totalQuarters = totalHizbCombinations * 4 // Each Hizb = 4 Rubʿ

      return NextResponse.json({
        success: true,
        data: {
          structure: {
            totalAyahs: stats[0],
            totalJuz: stats[1],
            totalHizb: stats[2], 
            totalQuarters: totalQuarters
          }
        }
      })
    }

    // If only juz is specified, return hizb list for that juz
    if (juzNumber && !hizbNumber) {
      const hizbList = await db.collection('quran_ayahs').aggregate([
        { $match: { juz_number: parseInt(juzNumber) } },
        {
          $group: {
            _id: '$hizb_number',
            quarterCount: { $addToSet: '$quarter_hizb_segment' },
            ayahCount: { $sum: 1 },
            surahs: { $addToSet: { surah: '$sura_number', surahName: '$sura_name_arabic' } }
          }
        },
        {
          $project: {
            hizbNumber: '$_id',
            quarterCount: { $size: '$quarterCount' },
            ayahCount: 1,
            surahs: 1
          }
        },
        { $sort: { hizbNumber: 1 } }
      ]).toArray()

      return NextResponse.json({
        success: true,
        data: {
          juz: parseInt(juzNumber),
          hizbs: hizbList
        }
      })
    }

    // If juz and hizb are specified, return quarters for that hizb
    if (juzNumber && hizbNumber && !quarterNumber) {
      // Get all ayahs for this Hizb
      const allAyahs = await db.collection('quran_ayahs')
        .find({ 
          juz_number: parseInt(juzNumber), 
          hizb_number: parseInt(hizbNumber) 
        })
        .sort({ sura_number: 1, ayah_number: 1 })
        .toArray()

      // Divide ayahs into 4 quarters (Rubʿ al-Hizb)
      const totalAyahs = allAyahs.length
      const ayahsPerQuarter = Math.ceil(totalAyahs / 4)
      
      const quarters = []
      
      for (let i = 0; i < 4; i++) {
        const startIndex = i * ayahsPerQuarter
        const endIndex = Math.min((i + 1) * ayahsPerQuarter, totalAyahs)
        const quarterAyahs = allAyahs.slice(startIndex, endIndex)
        
        if (quarterAyahs.length > 0) {
          const firstAyah = quarterAyahs[0]
          const lastAyah = quarterAyahs[quarterAyahs.length - 1]
          
          // Get unique surahs in this quarter
          const surahs = Array.from(new Set(quarterAyahs.map(ayah => ayah.sura_number)))
            .map(surahNum => {
              const ayah = quarterAyahs.find(a => a.sura_number === surahNum)
              return {
                surah: surahNum,
                surahName: ayah?.sura_name_arabic || ''
              }
            })
            .sort((a, b) => a.surah - b.surah)
          
          quarters.push({
            quarterNumber: i + 1,
            ayahCount: quarterAyahs.length,
            surahs: surahs,
            range: {
              start: {
                surah: firstAyah.sura_number,
                surahName: firstAyah.sura_name_arabic,
                ayah: firstAyah.ayah_number
              },
              end: {
                surah: lastAyah.sura_number,
                surahName: lastAyah.sura_name_arabic,
                ayah: lastAyah.ayah_number
              }
            }
          })
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          juz: parseInt(juzNumber),
          hizb: parseInt(hizbNumber),
          quarters: quarters
        }
      })
    }

    // If all parameters are specified, return ayahs for that quarter
    if (juzNumber && hizbNumber && quarterNumber) {
      // Get all ayahs for this Hizb
      const allAyahs = await db.collection('quran_ayahs')
        .find({ 
          juz_number: parseInt(juzNumber), 
          hizb_number: parseInt(hizbNumber)
        })
        .sort({ sura_number: 1, ayah_number: 1 })
        .toArray()

      // Divide ayahs into 4 quarters and get the requested quarter
      const totalAyahs = allAyahs.length
      const ayahsPerQuarter = Math.ceil(totalAyahs / 4)
      const quarterIndex = parseInt(quarterNumber) - 1 // Convert to 0-based index
      
      const startIndex = quarterIndex * ayahsPerQuarter
      const endIndex = Math.min((quarterIndex + 1) * ayahsPerQuarter, totalAyahs)
      const quarterAyahs = allAyahs.slice(startIndex, endIndex)

      // Format ayahs for display
      const formattedAyahs = quarterAyahs.map(ayah => ({
        id: ayah._id.toString(),
        surah: ayah.sura_number,
        surahName: ayah.sura_name_arabic,
        surahNameEnglish: ayah.sura_name_english || '',
        ayah: ayah.ayah_number,
        text: ayah.ayah_text_arabic,
        translation: ayah.ayah_text_english || '',
        juz: ayah.juz_number,
        hizb: ayah.hizb_number,
        quarter: parseInt(quarterNumber), // Use the proper quarter number 1-4
        page: ayah.page_number,
        ruku: ayah.ruku_number,
        sajda: ayah.sajda_type === 'obligatory' || ayah.sajda_type === 'recommended'
      }))

      return NextResponse.json({
        success: true,
        data: {
          juz: parseInt(juzNumber),
          hizb: parseInt(hizbNumber), 
          quarter: parseInt(quarterNumber),
          ayahCount: formattedAyahs.length,
          ayahs: formattedAyahs
        }
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid parameters' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Quran content fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Quran content' },
      { status: 500 }
    )
  }
}
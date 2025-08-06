const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

async function updateQuranStructure() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('quran-reciter-platform')
    
    // Load the complete Juz/Hizb/Quarter structure
    const structureData = JSON.parse(fs.readFileSync(path.join(__dirname, 'quran_juz_hizb_rub.json'), 'utf8'))
    
    console.log('Loaded structure data with', structureData.length, 'Juz')
    
    let updatedCount = 0
    let totalAyahs = 0
    
    // Process each Juz
    for (const juz of structureData) {
      console.log(`Processing Juz ${juz.juz}...`)
      
      // Process each Hizb in the Juz
      for (const hizb of juz.hizb) {
        console.log(`  Processing Hizb ${hizb.hizbNumber}...`)
        
        // Process each Quarter (Rub') in the Hizb
        for (const quarter of hizb.quarters) {
          console.log(`    Processing Quarter ${quarter.quarterNumber}...`)
          
          // Process each Ayah in the Quarter
          for (const ayah of quarter.ayahs) {
            totalAyahs++
            
            // Update the ayah in the database
            const updateResult = await db.collection('quran_ayahs').updateOne(
              { 
                sura_number: ayah.surah,
                ayah_number: ayah.ayah
              },
              {
                $set: {
                  juz_number: juz.juz,
                  hizb_number: hizb.hizbNumber,
                  quarter_hizb_segment: quarter.quarterNumber.toString()
                }
              }
            )
            
            if (updateResult.modifiedCount > 0) {
              updatedCount++
            }
            
            // Log progress every 500 ayahs
            if (totalAyahs % 500 === 0) {
              console.log(`    Processed ${totalAyahs} ayahs, updated ${updatedCount}`)
            }
          }
        }
      }
    }
    
    console.log(`\n=== Update Complete ===`)
    console.log(`Total ayahs processed: ${totalAyahs}`)
    console.log(`Total ayahs updated: ${updatedCount}`)
    
    // Verify the results
    const stats = await Promise.all([
      db.collection('quran_ayahs').countDocuments(),
      db.collection('quran_ayahs').distinct('juz_number').then(juz => juz.filter(j => j > 0).length),
      db.collection('quran_ayahs').distinct('hizb_number').then(hizb => hizb.filter(h => h > 0).length),
      db.collection('quran_ayahs').distinct('quarter_hizb_segment').then(q => q.filter(quarter => quarter !== '0').length),
      db.collection('quran_ayahs').countDocuments({ juz_number: 0 })
    ])
    
    console.log(`\n=== Verification ===`)
    console.log(`Total ayahs in database: ${stats[0]}`)
    console.log(`Unique Juz (excluding 0): ${stats[1]} (should be 30)`)
    console.log(`Unique Hizb (excluding 0): ${stats[2]} (should be 60)`)
    console.log(`Unique Quarters (excluding '0'): ${stats[3]} (should be 240)`)
    console.log(`Unassigned ayahs (Juz=0): ${stats[4]} (should be 0)`)
    
    if (stats[4] === 0) {
      console.log('\n✅ SUCCESS: All ayahs have been properly assigned!')
    } else {
      console.log(`\n⚠️  WARNING: ${stats[4]} ayahs still unassigned`)
    }
    
  } catch (error) {
    console.error('Error updating Quran structure:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the update
console.log('Starting Quran structure update...')
updateQuranStructure().catch(console.error)
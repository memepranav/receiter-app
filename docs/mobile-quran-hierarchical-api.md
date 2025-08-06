# Hierarchical Quran API Documentation

## Overview

This API provides hierarchical access to the Holy Quran following the traditional Islamic structure:

**30 Juz → 60 Hizb → 240 Rubʿ al-Hizb → 6,236 Ayahs**

## Base URL

```
https://your-domain.com/api/v1/quran
```

## Authentication

All endpoints require JWT authentication:

```http
Authorization: Bearer <your-jwt-token>
```

## Structure Overview

### GET `/structure`

Get the complete Quran structure overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAyahs": 6236,
    "totalJuz": 30,
    "totalHizb": 60,
    "totalQuarters": 240,
    "description": "30 Juz → 60 Hizb → 240 Rubʿ al-Hizb → 6,236 Ayahs"
  }
}
```

---

## Level 1: Juz (Para) Navigation

### GET `/juz`

Get list of all 30 Juz (existing endpoint).

### GET `/juz/{juzNumber}`

Get specific Juz content (existing endpoint).

**Parameters:**
- `juzNumber`: Integer (1-30)

---

## Level 2: Hizb Navigation

### GET `/juz/{juzNumber}/hizbs`

Get list of Hizb for a specific Juz.

**Parameters:**
- `juzNumber`: Integer (1-30)

**Response:**
```json
{
  "success": true,
  "data": {
    "juzNumber": 1,
    "hizbs": [
      {
        "hizbNumber": 1,
        "ayahCount": 148,
        "quarterCount": 4,
        "surahs": [
          {
            "surah": 1,
            "surahName": "الفاتحة"
          },
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ]
      },
      {
        "hizbNumber": 2,
        "ayahCount": 111,
        "quarterCount": 4,
        "surahs": [
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ]
      }
    ]
  }
}
```

### GET `/juz/{juzNumber}/hizb/{hizbNumber}`

Get specific Hizb content.

**Parameters:**
- `juzNumber`: Integer (1-30)
- `hizbNumber`: Integer (1-60)
- `includeText`: Boolean (optional) - Include full ayah text

**Response:**
```json
{
  "success": true,
  "data": {
    "juzNumber": 1,
    "hizbNumber": 1,
    "ayahCount": 148,
    "quarterCount": 4,
    "surahs": [
      {
        "surah": 1,
        "surahName": "الفاتحة"
      },
      {
        "surah": 2,
        "surahName": "البقرة"
      }
    ],
    "ayahs": [
      // Only included if includeText=true
      {
        "id": "1:1",
        "surah": 1,
        "surahName": "الفاتحة",
        "ayah": 1,
        "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        "juz": 1,
        "hizb": 1,
        "quarter": 1
      }
    ]
  }
}
```

---

## Level 3: Rubʿ al-Hizb (Quarter) Navigation

### GET `/juz/{juzNumber}/hizb/{hizbNumber}/quarters`

Get list of 4 quarters (Rubʿ al-Hizb) for a specific Hizb.

**Parameters:**
- `juzNumber`: Integer (1-30)
- `hizbNumber`: Integer (1-60)

**Response:**
```json
{
  "success": true,
  "data": {
    "juzNumber": 1,
    "hizbNumber": 1,
    "quarters": [
      {
        "quarterNumber": 1,
        "ayahCount": 37,
        "surahs": [
          {
            "surah": 1,
            "surahName": "الفاتحة"
          },
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ],
        "range": {
          "start": {
            "surah": 1,
            "surahName": "الفاتحة",
            "ayah": 1
          },
          "end": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 30
          }
        }
      },
      {
        "quarterNumber": 2,
        "ayahCount": 37,
        "surahs": [
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ],
        "range": {
          "start": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 31
          },
          "end": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 67
          }
        }
      },
      {
        "quarterNumber": 3,
        "ayahCount": 37,
        "surahs": [
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ],
        "range": {
          "start": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 68
          },
          "end": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 104
          }
        }
      },
      {
        "quarterNumber": 4,
        "ayahCount": 37,
        "surahs": [
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ],
        "range": {
          "start": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 105
          },
          "end": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 141
          }
        }
      }
    ]
  }
}
```

---

## Level 4: Ayah Content

### GET `/juz/{juzNumber}/hizb/{hizbNumber}/quarter/{quarterNumber}`

Get specific Rubʿ al-Hizb (quarter) content with all ayahs.

**Parameters:**
- `juzNumber`: Integer (1-30)
- `hizbNumber`: Integer (1-60)  
- `quarterNumber`: Integer (1-4)
- `translation`: String (optional) - Translation identifier
- `reciter`: String (optional) - Reciter identifier for audio
- `textFormat`: String (optional) - 'uthmani', 'indopak', 'simple'

**Response:**
```json
{
  "success": true,
  "data": {
    "juzNumber": 1,
    "hizbNumber": 1,
    "quarterNumber": 1,
    "rubAlHizb": "Rubʿ 1",
    "ayahCount": 37,
    "surahs": [
      {
        "surah": 1,
        "surahName": "الفاتحة"
      },
      {
        "surah": 2,
        "surahName": "البقرة"
      }
    ],
    "range": {
      "start": {
        "surah": 1,
        "surahName": "الفاتحة",
        "ayah": 1
      },
      "end": {
        "surah": 2,
        "surahName": "البقرة",
        "ayah": 30
      }
    },
    "ayahs": [
      {
        "id": "1:1",
        "surah": 1,
        "surahName": "الفاتحة",
        "ayah": 1,
        "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        "translation": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        "juz": 1,
        "hizb": 1,
        "quarter": 1,
        "page": 1,
        "sajda": false
      },
      {
        "id": "1:2",
        "surah": 1,
        "surahName": "الفاتحة",
        "ayah": 2,
        "text": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
        "translation": "[All] praise is [due] to Allah, Lord of the worlds -",
        "juz": 1,
        "hizb": 1,
        "quarter": 1,
        "page": 1,
        "sajda": false
      }
      // ... more ayahs
    ]
  }
}
```

---

## Query Parameters

### Common Parameters

- `translation`: Translation identifier (e.g., 'sahih-international', 'pickthall')
- `reciter`: Reciter identifier for audio URLs (e.g., 'abdul-basit', 'sudais')
- `textFormat`: Arabic text format ('uthmani', 'indopak', 'simple')
- `includeText`: Boolean to include/exclude Arabic text (performance optimization)

### Available Translations

Use the existing endpoint:

```
GET /v1/quran/translations
```

### Available Reciters

Use the existing endpoint:

```
GET /v1/quran/reciters
```

---

## Navigation Flow Examples

### 1. Browse by Structure

```javascript
// 1. Get structure overview
const structure = await fetch('/api/v1/quran/structure');

// 2. Browse Juz 1
const juz1Hizbs = await fetch('/api/v1/quran/juz/1/hizbs');

// 3. Browse Hizb 1 quarters
const hizb1Quarters = await fetch('/api/v1/quran/juz/1/hizb/1/quarters');

// 4. Get Quarter 1 content
const quarter1 = await fetch('/api/v1/quran/juz/1/hizb/1/quarter/1?translation=sahih-international');
```

### 2. Direct Access

```javascript
// Direct access to specific quarter with translation
const response = await fetch('/api/v1/quran/juz/5/hizb/9/quarter/3?translation=pickthall&reciter=sudais');
```

### 3. Performance Optimization

```javascript
// Get structure without text for navigation
const quarters = await fetch('/api/v1/quran/juz/1/hizb/1/quarters');

// Get full content when needed
const fullQuarter = await fetch('/api/v1/quran/juz/1/hizb/1/quarter/1?includeText=true&translation=sahih-international');
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid Juz number",
  "statusCode": 400
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Quarter not found",
  "statusCode": 404
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## Caching

- Structure overview: Cached for 1 day
- Juz/Hizb lists: Cached for 30 minutes
- Content with ayahs: Cached for 30 minutes
- All responses include Redis caching for optimal performance

---

## Rate Limiting

- 1000 requests per hour per user
- Cached responses don't count toward rate limit

---

## Islamic Terminology

- **Juz (جزء)**: One of 30 equal sections of the Quran (also called Para in Urdu/Hindi)
- **Hizb (حزب)**: One of 60 sections, each Juz contains 2 Hizb
- **Rubʿ al-Hizb (رُبْعُ الحِزْب)**: Quarter of a Hizb, totaling 240 sections
- **Ayah (آية)**: Individual verse of the Quran

This structure allows users to navigate the Quran exactly as it's traditionally organized in Islamic texts and apps worldwide.
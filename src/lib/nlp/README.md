# EmpathAI NLP Library

This directory contains the NLP (Natural Language Processing) capabilities for the EmpathAI project, converted from the Python-based Multi-task-NLP project into JavaScript/TypeScript for use in a Next.js application.

## Features

- **Part-of-Speech Tagging**: Identifies and categorizes words by grammatical parts of speech (nouns, verbs, adjectives, etc.)
- **Keyword Extraction**: Extracts important terms and phrases from text
- **Sentiment Analysis**: Determines the emotional polarity of text (positive, negative, neutral)
- **Emotion Detection**: Detects specific emotions expressed in text (joy, sadness, anger, etc.)
- **Named Entity Recognition**: Identifies and categorizes entities (people, organizations, locations, dates, etc.)

## Usage

### Client-Side Usage

Import the modules directly:

```typescript
import { 
  POSTagging, 
  KeywordExtractor,
  SentimentAnalysis,
  EmotionDetection,
  NamedEntityRecognition
} from '@/lib/nlp';

// Initialize processors
const posTagging = new POSTagging();
const keywordExtractor = new KeywordExtractor();
const sentimentAnalysis = new SentimentAnalysis();
const emotionDetection = new EmotionDetection();
const namedEntityRecognition = new NamedEntityRecognition();

// Use them in your component
async function analyzeText(text: string) {
  const posResult = posTagging.classify(text);
  const keywordResult = await keywordExtractor.generate(text, 5);
  const sentimentResult = sentimentAnalysis.classify(text);
  const emotionResult = emotionDetection.classify(text);
  const nerResult = await namedEntityRecognition.classify(text);
  
  // Do something with the results
  console.log(posResult.tokens);
  console.log(keywordResult.keywords);
  console.log(sentimentResult.predictions);
  console.log(emotionResult.predictions);
  console.log(nerResult.entities);
}
```

### API Usage

Use the NLP API endpoint to process text:

```typescript
// Client-side code
async function callNlpApi(text: string) {
  const response = await fetch('/api/nlp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      tasks: ['pos', 'keywords', 'sentiment', 'emotion', 'ner']
    })
  });
  
  const data = await response.json();
  return data.results;
}
```

Or use the GET endpoint:

```
GET /api/nlp?text=Hello%20world!&tasks=pos,keywords,sentiment
```

## Implementation Details

This library uses:

- **Compromise**: A lightweight natural language processing library for JavaScript
- **Custom Algorithms**: For keyword extraction, sentiment analysis, and emotion detection
- **Browser-compatible**: All processing is done client-side without external API calls

## Types

The library exports TypeScript interfaces for all NLP tasks:

```typescript
import type { 
  POSResult, 
  KeywordResult,
  SentimentResult,
  EmotionResult,
  NERResult,
  Entity 
} from '@/lib/nlp';
``` 
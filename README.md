# WordWeaverAI - AI-Powered Essay Assistant

WordWeaverAI is a sophisticated essay writing and editing platform that leverages AI to help students and writers create, refine, and format high-quality essays. Built during Bear Hacks, this application streamlines the entire essay writing workflow from initial drafting to final formatting.

## Preview Images

## Features

### AI-Powered Essay Generation
- Generate well-structured essays on any topic
- Customize essay length, style, and tone
- Save time on research and initial drafting

### Smart Editing Environment
- Intuitive markdown editor with live preview
- Format text with headings, bold, and italic styling
- Real-time word count tracking

### Citations Management
- Automatically track and organize citation sources
- Generate properly formatted works cited sections
- Support for multiple citation styles (MLA, APA, Chicago)

### Essay Review & Analysis
- Get AI feedback on essay quality
- Receive scores for grammar, structure, substance, and overall quality
- Get actionable suggestions for improvement

### Targeted Essay Tweaking
- Submit specific feedback for areas that need improvement
- AI makes targeted enhancements while preserving your voice and style
- Compare before and after versions

### Export Options
- Download essays in markdown format
- Download essays as PDF documents
- Retain all formatting and citations

## Technology Stack

- **Frontend**: Next.js 14 with React, TypeScript, and Tailwind CSS
- **Backend**: Next.js API routes with serverless functions
- **Database**: MongoDB with Mongoose for data modeling
- **Authentication**: Custom JWT-based authentication system
- **AI Integration**:
  - Perplexity AI API for essay generation, reviews, and tweaking
  - Custom prompting techniques for specialized writing tasks
- **Styling**: TailwindCSS with custom gradient designs and responsive layouts

## How It Works

1. **User Authentication**: Sign up or log in to access the platform
2. **Create Essay**: Enter topic, thesis, and optional writing parameters
3. **AI Generation**: Our AI creates a well-structured essay based on your inputs
4. **Edit & Refine**: Make changes to the generated content in the markdown editor
5. **Add Citations**: Track sources and generate properly formatted citations
6. **Review & Improve**: Get AI feedback on your essay's quality and make improvements
7. **Export**: Download your finished essay in your preferred format

## Development Process

WordWeaverAI was built during Bear Hacks in several phases:

1. **Initial Setup**: Created Next.js project with TypeScript and configured MongoDB
2. **Authentication**: Implemented user authentication and session management
3. **Core Essay Functionality**: Developed essay creation, editing, and storage
4. **AI Integration**: Connected to Perplexity API for essay generation and enhancement
5. **Citation System**: Built citation tracking and works cited generation
6. **Review System**: Created AI-powered essay review functionality
7. **UI/UX Design**: Designed responsive interface with Tailwind CSS
8. **Testing & Refinement**: Tested all features and refined user experience
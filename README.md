# معالج البيانات العربية (Arabic Data Processor)

A comprehensive solution for preparing datasets from Arabic scanned PDF files with a user-friendly control interface.

## Features

- **Data Upload Interface**: Intuitive interface for uploading multiple Arabic scanned PDF files
- **OCR Processing**: Optimized for Arabic text extraction from scanned PDFs
- **Data Cleaning**: Automatic cleaning and normalization of extracted Arabic text
- **Dataset Creation**: Export processed data in structured formats (JSON, CSV)
- **Interactive Editing**: Manual correction of OCR results through an interactive editor

## Project Structure

```
data-preparing-cline/
├── public/                  # Static assets
├── src/
│   ├── backend/             # Express.js server
│   │   ├── routes/          # API routes
│   │   └── server.js        # Server entry point
│   └── frontend/            # React frontend
│       ├── components/      # React components
│       ├── context/         # React context providers
│       ├── config/          # Configuration files
│       ├── styles/          # CSS styles
│       ├── App.js           # Main React component
│       └── index.js         # Frontend entry point
├── functions/               # Netlify serverless functions
├── uploads/                 # Directory for uploaded files
├── .env                     # Environment variables
├── package.json             # Project dependencies
└── webpack.config.js        # Webpack configuration
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/abusaleh34/data-preparing-cline.git
   cd data-preparing-cline
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create required directories:
   ```
   mkdir -p uploads/processed uploads/temp uploads/datasets
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Deploy to Netlify

1. Fork or clone this repository to your GitHub account
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Select your repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy site"
7. Once deployed, go to Site settings > Functions > Settings and set the functions directory to `functions`
8. Set up environment variables in Site settings > Build & deploy > Environment

### Local Deployment

To run the application locally:

```
npm run dev
```

This will start both the backend server and the frontend development server.

## Usage

1. **Upload Files**: Navigate to the Upload page to upload PDF files
2. **Process Files**: Go to the Process page to run OCR on uploaded files
3. **Edit Results**: Use the interactive editor to correct OCR results
4. **Create Datasets**: Generate structured datasets in JSON or CSV format

## Technologies Used

- **Frontend**: React, React Router, Axios
- **Backend**: Express.js, Multer
- **OCR**: Tesseract.js with Arabic language support
- **Deployment**: Netlify with serverless functions

## License

This project is licensed under the MIT License.

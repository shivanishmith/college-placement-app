# College Placement Portal Frontend

A React TypeScript application that provides a comprehensive placement portal for colleges, connecting students with job opportunities.

## Features

### Authentication
- User login and registration
- Role-based access control (Students, Teachers, Superadmins)

### Dashboard
- Role-specific dashboard views
- Quick access to relevant features based on user role

### Profile Management
- Text fields customization
- Profile image upload to Cloudinary
- Resume/CV upload to Cloudinary
- Multiple content types support (text, images, PDFs)

### Job Management
- Job listings for all users
- Job application functionality for students
- Job creation for teachers and superadmins
- Job editing for teachers (own jobs) and superadmins (all jobs)
- Job deletion with confirmation dialog

## Tech Stack

- **Frontend**: React, TypeScript, Material UI
- **Backend**: Node.js, Express
- **Storage**: Cloudinary for image and document storage

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
   REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```
4. Start the development server:
   ```
   npm start
   ```

## Backend Integration

This frontend connects to a Node.js/Express backend. Make sure the backend server is running and configured correctly with Cloudinary integration for file uploads.

## Project Structure

- `/components` - Reusable UI components
- `/pages` - Main application pages
- `/services` - API communication services
- `/utils` - Utility functions
- `/context` - React context for state management
- `/types` - TypeScript type definitions

## User Roles

- **Students**: Apply for jobs, manage profiles
- **Teachers**: Create/edit their own job postings, view applications
- **Superadmins**: Full system access, manage all job postings

## License

MIT
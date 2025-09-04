# VideoPlatform

A full-featured video platform built with Node.js, Express, MongoDB, and React. Supports features like video publishing, comments, likes, playlists, subscriptions, and more!

---

##  Features

- User authentication and profile management  
- Upload and publish videos (with Cloudinary integration)  
- View and search videos with pagination and sorting  
- Like/unlike videos, comments, and tweets  
- Comment on videos  
- Create and manage playlists (add/remove videos)  
- Subscribe to channels and manage subscriptions  
- Channel statistics: total videos, views, subscribers, likes  

---

##  Tech Stack

| Layer         | Technologies                                      |
|---------------|--------------------------------------------------|
| Backend       | Node.js, Express.js, Mongoose, MongoDB           |
| Cloud Storage | Cloudinary for video/thumbnail uploads            |
| Auth & State  | JWT-based auth (or similar middleware)           |
| Utilities     | Custom ApiError, ApiResponse, asyncHandler utils |

---

##  Getting Started

###  Prerequisites

- Node.js (v16 or above)  
- MongoDB (local or cloud instance)  
- Cloudinary account (API key & secret)  

###  Installation

```bash
# Clone the repo
git clone https://github.com/sanketg1234/videoplatform.git
cd videoplatform

# Install dependencies
npm install

# Create a .env file with the required environment variables:
# MONGODB_URI, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# Start the development server
npm run dev

# Your API will run at http://localhost:5000 (or whichever port is configured)

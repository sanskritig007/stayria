# Stayria

Stayria is an Airbnb-inspired full-stack web application for discovering, creating, and reviewing stay listings. It includes user authentication, listing management, image uploads, category/search filtering, reviews, maps, and a polished property detail page.

## Live Demo

- Deployed App: `https://stayria.onrender.com`
- GitHub Repository: `https://github.com/sanskritig007/stayria`

## Features

- Browse all stays with category filters and search
- Create, edit, and delete listings as an authenticated host
- Upload listing images with Cloudinary
- View listing details with photos, host info, amenities, reviews, and map location
- Add and delete reviews with ratings
- User signup, login, logout, sessions, and flash messages
- Authorization checks so only owners can edit/delete their listings
- MongoDB-backed sessions for production-ready login persistence

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- EJS + EJS Mate
- Passport.js authentication
- Cloudinary + Multer for image uploads
- Mapbox for geocoding and maps
- Joi validation
- Bootstrap / custom CSS

## Getting Started

Follow these steps to run the project locally.

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Add these environment variables:

```env
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_mapbox_token
PORT=8080
```

### 3. Run the app

```bash
node app.js
```

Open:

```text
http://localhost:8080/listings
```

## Deployment

The app is deployed and can be updated by pushing new commits to the connected GitHub repository.

```bash
git add .
git commit -m "Update project"
git push origin main
```

If the deployment platform does not auto-deploy, trigger a manual deploy from the hosting dashboard.

## Main Routes

- `GET /listings` - view all listings
- `GET /listings/new` - create listing form
- `POST /listings` - create a listing
- `GET /listings/:id` - show listing details
- `GET /listings/:id/edit` - edit listing form
- `PUT /listings/:id` - update listing
- `DELETE /listings/:id` - delete listing
- `POST /listings/:id/reviews` - add review
- `DELETE /listings/:id/reviews/:reviewId` - delete review
- `GET /signup` - signup page
- `GET /login` - login page
- `GET /logout` - logout

## Project Structure

```text
controllers/   Route controller logic
models/        Mongoose schemas
routes/        Express routers
views/         EJS templates
public/        CSS and client-side JavaScript
utils/         Error and async helpers
```

## Future Improvements

- Wishlist / saved stays
- Booking system with check-in, checkout, and guests
- Search by available dates and guest count
- Host dashboard
- Image gallery improvements
- Payment integration

## Status

This project is deployed and under active development as a full-stack Airbnb clone.

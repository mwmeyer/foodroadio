# FoodRoadio 🌮✨

**Turn your culinary space into a gathering place!**

The platform that connects food lovers with amazing food trucks AND helps food entrepreneurs transform their venues into vibrant community event spaces.

**🚀 [Live App](https://foodroadio.vercel.app/)**

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

Then visit:
- **Main App:** `http://localhost:3000` (or the port shown in terminal)
- **Operator Portal:** `http://localhost:3000/operator`
- **Eater Portal:** `http://localhost:3000/eater`

📖 **For food truck operators:** Check out the [User Portals Guide](./USER_PORTALS_GUIDE.md)  
📖 **For food lovers:** Check out the [User Portals Guide](./USER_PORTALS_GUIDE.md)

## What is FoodRoadio?

FoodRoadio serves two connected communities:

**🍽️ For Food Lovers:** Discover incredible food trucks and the exciting events they host - from live music nights to cooking classes, community meetups to themed dining experiences.

**👨‍🍳 For Food Entrepreneurs:** Transform your food truck (or restaurant) into more than just a place to eat. Host events, build community, and create memorable experiences that keep customers coming back.

## Current Features

### Food Truck Discovery
- Interactive map with food truck locations
- Search by cuisine, city, or events
- Get directions to trucks
- Event calendar integration
- Community-contributed trucks

### **NEW: Dual User Portals** 🎉

#### 🚚 Operator Portal
Food truck operators can:
- **Claim existing trucks** from the database
- **Add new trucks** to expand the network
- **Create and manage events** (cooking classes, live music, trivia, etc.)
- **Update event details** including date, time, pricing, and capacity
- Have events **automatically appear** on the main map for customers

#### 🍽️ Eater Portal
Food lovers can:
- **Add new food trucks** they discover
- **Write reviews** with ratings and detailed feedback
- **Track contributions** (trucks added and reviews written)
- **Build the community** by sharing discoveries

👉 **[Read the User Portals Guide](./USER_PORTALS_GUIDE.md)** to get started!

### Event Discovery
- Browse events by type (Cooking Classes, Live Music, Trivia, etc.)
- View event details including date, time, and pricing
- See available spots for each event
- Filter food trucks by the events they host

## Planned Features

### For Food Lovers
- **Event Discovery:** Find cooking classes, live music nights, trivia, and themed dining experiences at your favorite food trucks
- **Event Calendar:** See what's happening at food trucks near you
- **RSVP & Tickets:** Book spots for special events and experiences
- **Reviews & Photos:** Share your event experiences with the community
- **Notifications:** Get alerts when your favorite trucks announce new events
- **Add Trucks:** Contribute new food truck discoveries to the map

### For Food Entrepreneurs (Operators)
- **Event Creation Tools:** Easily set up and promote events at your venue
- **Event Management:** Handle RSVPs, capacity limits, and attendee communication
- **Community Building:** Create regular events that bring customers back
- **Revenue Opportunities:** Monetize your space with ticketed events and experiences
- **Analytics Dashboard:** Track event success and customer engagement
- **Marketing Tools:** Promote your events to the right audience

### Enhanced Food Discovery
- Real-time truck schedules and routes
- Menu browsing and pre-ordering
- User reviews and ratings
- Favorite trucks and notifications
- Event-enhanced truck profiles

## Event Ideas for Food Entrepreneurs

- **Cooking Classes:** Teach customers your signature techniques
- **Live Music Nights:** Partner with local musicians
- **Trivia & Game Nights:** Build a regular community
- **Themed Dinners:** Special menus for holidays or cultural celebrations
- **Pop-up Collaborations:** Partner with other local businesses
- **Community Meetups:** Host book clubs, hobby groups, or professional networks
- **Kids' Events:** Family-friendly cooking classes or story time

## Tech Stack

- **Framework:** Next.js 14 with TypeScript
- **Monorepo:** Turborepo
- **Styling:** Tailwind CSS
- **Maps:** Leaflet
- **UI Components:** React Native Web (shared between web and native)
- **State Management:** React Hooks
- **Data Storage:** localStorage (for demo; ready to migrate to database)
- **Authentication:** Demo mode (ready to integrate Auth0, NextAuth, or Supabase)
- **Deployment:** Vercel

## Vision

Every food truck has the potential to be more than just a place to grab a quick meal. FoodRoadio helps food entrepreneurs unlock that potential by providing the tools to create memorable experiences and build lasting communities around their culinary passion.

Starting with food trucks and expanding to restaurants, we're building the platform that transforms any culinary space into a vibrant gathering place where food brings people together.

---

*Built to learn Turborepo, Next.js, and modern web development while helping food entrepreneurs build thriving communities.*
# Multiplayer Bingo Game

A real-time multiplayer bingo game built with React, Supabase, and Socket.io.

## Features

- User authentication with Supabase
- Create and join game rooms
- Real-time gameplay with Socket.io
- Randomized bingo card generation
- Automatic number calling
- Win detection for various bingo patterns
- Game history tracking

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication & Database**: Supabase
- **Real-time Communication**: Socket.io
- **Animations**: Framer Motion
- **Build Tool**: Vite

## Project Setup

### Prerequisites

- Node.js (v16 or later)
- Supabase account

### Configuration

1. Create a Supabase project at https://supabase.com
2. Get your Supabase URL and anon key
3. Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the SQL migrations in `/supabase/migrations` in your Supabase SQL editor

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# In a separate terminal, start the WebSocket server
npm run server
```

## Game Flow

1. User signs up/logs in
2. User creates a game or joins an existing one
3. Host starts the game when ready
4. Numbers are called automatically
5. Players mark numbers on their cards
6. First player to get a valid pattern (row, column, diagonal) wins
7. Game results are saved

## Deployment

For deployment, you would need to:

1. Deploy the React frontend (e.g., Netlify, Vercel)
2. Deploy the Socket.io server (e.g., Heroku, Render)
3. Update the Socket.io connection URL in `src/lib/socket.ts`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
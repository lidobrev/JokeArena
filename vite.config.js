import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        profile: resolve(__dirname, 'profile.html'),
        createJoke: resolve(__dirname, 'create-joke.html'),
        editJoke: resolve(__dirname, 'edit-joke.html'),
        jokeDetails: resolve(__dirname, 'joke-details.html'),
        admin: resolve(__dirname, 'admin.html'),
        latestJokes: resolve(__dirname, 'latest-jokes.html'),
        topRated: resolve(__dirname, 'top-rated.html'),
        categoryJokes: resolve(__dirname, 'category-jokes.html'),
        creators: resolve(__dirname, 'creators.html'),
      },
    },
  },
})

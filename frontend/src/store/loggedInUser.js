// This pinia store contains state with respect to whether a user is logged in 
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'

//Notifications
const toast = useToast()

const USERS = {
  user: {
    password: 'user',
    role: 'viewer',
    name: 'Viewer User'
  },
  admin: {
    password: 'admin',
    role: 'editor',
    name: 'Editor Admin'
  }
}

// Defining a store
export const useLoggedInUserStore = defineStore({
  id: 'loggedInUser',
  state: () => {
    return {
      name: "",
      role: "",
      isLoggedIn: false
    }
  },
  actions: {
    async login(username, password, redirectPath = '/') {
      const trimmedUsername = username?.trim().toLowerCase()
      if (!trimmedUsername || !password) {
        toast.error('Please enter a username and password.')
        return false
      }

      const userRecord = USERS[trimmedUsername]

      if (!userRecord || userRecord.password !== password) {
        toast.error('Invalid username or password.')
        return false
      }

      this.$patch({
        isLoggedIn: true,
        role: userRecord.role,
        name: userRecord.name
      })
      this.$router.push(redirectPath || '/')
      toast.success('Login Successful!')
      return true
    },
    logout() {
      // Reset value after user log out
      this.$patch({
        name: "",
        role: "",
        isLoggedIn: false
      });
      this.$router.push("/");
      toast.info("You have been logged out!")
    }
  },
});

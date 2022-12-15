import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vue3Geolocation from 'vue3-geolocation'
import './assets/main.css'
import { createStore } from 'vuex'

//store created using vuex to save and get variables needed by multiple vues in this project
const store = createStore({
    //creates states for desired variables to be stored
    state () {
      return {
        name: "",     //name of the current school
        access: false //boolean to determine if user has access to school forum
      }
    },
    //creates functions that change/mutate the states/variables in the store
    mutations: {
        //function for storing school name
        saveSchoolName(state, schoolName) {
            state.name = schoolName
        },
        //function for storing boolean on users access to the school forum
        saveSchoolAccess(state, schoolAccess) {
            state.access = schoolAccess
        }
    },
    //creates getters for states/variables in the store
    getters: {
        getSchoolName(state) {
            return state.name
        },
        getSchoolAccess(state) {
            return state.access
        }
    }
  })
  

const app = createApp(App)

app.use(Vue3Geolocation)
app.use(router)
app.use(store)

app.mount('#app')


<template>
  <!--This template is for the welcome page-->
  <div v-if="location.access == false">

    <!-- This conditional is mased on initialized values so it appears automatically when loading into the page -->
    <main v-if="coordinates.lng == 0" class="local">
      <div class="pin"></div>
      <div class="pulse"></div>
    </main>
  </div>

  <div v-else-if="location.access == true">
    <header id="app-header" class="app-header">
      <vue-basic-alert :duration="100" :closeIn="900" ref="alert" />

      <nav>
        <img alt="logo" class="logo" src="@/assets/uTawkLogo.png" width="200" height="200" />
        <h3 class="animate-charcter"></h3>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <div class="server">
          <img src="@/assets/server.png" alt="">
          <h4 v-if="this.school.access == true" :key="componentKey1">Tawking in {{ this.school.name }}
          </h4>
          <h4 v-else :key="componentKey2">Watching {{ this.school.name }}</h4>
        </div>
      </nav>

    </header>

    <router-view v-slot="{ Component }">
      <transition :name="$route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

  </div>
</template>

<script lang="js">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { closest } from './utilities/distance.js'
import { collections } from './utilities/collections.js';

import { ref } from 'vue'
import VueBasicAlert from 'vue-basic-alert'

const componentKey1 = ref(0)
const componentKey2 = ref(0)

const forceRerender = () => {
  componentKey1.value += 1
  componentKey2.value += 1
}

export default {
  data() {
    return {
      coordinates: {
        lat: 0,
        lng: 0
      },
      school: {
        access: false,
        name: "nada"
      },
      location: {
        access: false
      },
      componentKey1: 0,
      componentKey2: 0
    }
  },
  methods: {
    forceRerender() {
      this.componentKey1 += 1,
        this.componentKey2 += 1
    },
  },
  created() {
    this.$getLocation({})
      .then((coordinates) => {

        this.location.access = true //updates variable to let page know we have access to users location

        this.coordinates = coordinates //this saves the coordinates retrived from $getlocation to intial variables

        //all this code is for testing different coordinate locations besides users current location
        //-----------------------------------------------------------------------------------------//
        //COORDINATES FOR INSIDE UNCW

        // this.coordinates.lat = 34.2239
        // this.coordinates.lng = -77.8696

        //COORDINATES FOR INSIDE APP STATE

        //this.coordinates.lat = 36.2136
        //this.coordinates.lng = -81.6843

        //COORDINATES FOR OUTSIDE OF APP STATE

        //this.coordinates.lat = 36.0
        //this.coordinates.lng = -81.0

        //COORDINATES FOR INSIDE NC STATE

        // this.coordinates.lat = 35.7847
        // this.coordinates.lng = -78.6821

        //COORDINATES FOR OUTSIDE OF NC STATE

        //this.coordinates.lat = 35.7
        //this.coordinates.lng = -78.6
        //-----------------------------------------------------------------------------------------//


        //variables for checking user distance
        let setRadius = 100 //change this value to set radius to be able to chat 
        let values = closest(collections, this.coordinates.lat, this.coordinates.lng) //usses function that determines the closest school to the user

        //variables for saving and share with webpage from previous closest function
        const school = values[0]         //saves school name from previous "closest"
        const userDis = values[1]        //saves users distance to closest school
        const collectionName = values[2] //saves name of the closest schools datapase collection

        //saving and sharing school name to webpage
        this.school.name = school  //variable for school name
        this.$store.commit("saveSchoolName", collectionName) //storing school name into store that the webpage has access to

        //calls function that updates school info in html
        forceRerender

        //this line checks if the users distance to the closest school is close enough to actually chat in the forum, right now its "1 mile" 
        if (userDis < setRadius) {
          this.school.access = true //updates variable for knowing if user is close enough to access forum
          this.$store.commit("saveSchoolAccess", true) //updates variable in store to share user hhas acces to school forum

          //alerts user of forum user is accessing
          //     $refs.alert.showAlert(
          //   'success', // There are 4 types of alert: success, info, warning, error
          //   'This is the information of something you may know Success.', // Message of the alert
          //   'Success 200', // Header of the alert
          //   { iconSize: 35, // Size of the icon (px)
          //     iconType: 'solid', // Icon styles: now only 2 styles 'solid' and 'regular'
          //     position: 'top right' } // Position of the alert 'top right', 'top left', 'bottom left', 'bottom right'
          // )
          this.$refs.showAlert('success', "Welcome", "header", { iconSize: 35, iconType: 'solid', position: 'top right' })
          alert("You are in range of our " + school + " chatroom!")

        } else {
          this.$store.commit("saveSchoolAccess", false) //makes sure html is updated properly if some sort of location spoofing takes place

          //alerts user of forum user is closest too and currently viewing
          alert("The closest chatroom is our " + school + " chatroom, move to chat in this chatroom.")

        }

        //this code runs if the user denies the webpage access to their location
      }).catch(() => {
        this.coordinates.lat = 1
      })
  }
}

</script>

<style scoped>
main {
  min-height: 100vh;
}

.local h2 {
  text-align: center;
  color: rgb(252, 252, 99);
  margin-top: 20%;
  -webkit-animation: pulsate 3s ease-out;
  -webkit-animation-iteration-count: infinite;
  opacity: 0.5;
  font-size: 30px;
  text-transform: uppercase;
  font-style: italic;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 0 #ccc,
}

@-webkit-keyframes pulsate {
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 1.0;
  }

  100% {
    opacity: 0.5;
  }
}

header {}

nav {
  display: flex;
  align-items: center;
  width: clamp(280px, 90%, 1280px);
  margin: auto;
  padding: 0;
  height: 4rem;
}

nav img {
  right: 200px;
  width: 80px;
  height: 80px;
}

img.logo {
  margin: 0;
}

h3 {
  font-size: 2rem;
  font-weight: 300;
  color: white;
  margin-right: auto;
}

nav a {
  color: rgba(255, 255, 255, 0.5);
  transition: 0.5s all ease;
  font-weight: 500;
  margin-right: 1rem;
}

nav a:hover {
  color: white;
}

nav a.router-link-exact-active {
  color: red;
}

nav .server {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
}

nav .server img {
  filter: invert();
  height: 20px;
  object-fit: contain;
}

nav .server h4 {
  color: white;
  font-weight: 300;
  font-size: 0.6rem;
}

@media only screen and (max-width: 520px) {
  .animate-charcter {
    display: none;
  }

  nav .logo {
    margin-right: 50px;
  }
}

@media only screen and (max-width: 900px) and (min-width: 521px) {


  .animate-charcter {
    font-size: 35px;
    margin-top: 6px;
  }
}

body {
  background: #e6e6e6;
}




.pin {
  transform: rotate(-45deg);
  width: 60px;
  height: 60px;
  border-radius: 50% 50% 50% 0;
  background: teal;
  position: absolute;
  left: 50%;
  top: 50%;
  margin: -40px 0 0 -40px;
  animation: bounce;
  animation-fill-mode: both;
  animation-duration: 1s;
}

.pin:after {
  content: "";
  width: 28px;
  height: 28px;
  margin: 16px 0 0 16px;
  background: #e6e6e6;
  position: absolute;
  border-radius: 50%;
}



.pulse {
  transform: rotateX(55deg);
  background: #d6d4d4;
  border-radius: 50%;
  height: 28px;
  width: 28px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin: 22px 0px 0px -24px;
  z-index: -2;
}

.pulse:after {
  content: "";
  border-radius: 50%;
  height: 80px;
  width: 80px;
  position: absolute;
  margin: -26px 0 0 -26px;
  animation: pulsate 1s ease-out;
  animation-iteration-count: infinite;
  opacity: 0;
  box-shadow: 0 0 1px 2px #00cae9;
  animation-delay: 1.1s;
}

@keyframes pulsate {
  0% {
    transform: scale(0.1, 0.1);
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    transform: scale(1.2, 1.2);
    opacity: 0;
  }
}

@keyframes bounce {
  0% {
    opacity: 0;
    filter: alpha(opacity=0);
    transform: translateY(-2000px) rotate(-45deg);
  }

  60% {
    opacity: 1;
    filter: none;
    transform: translateY(30px) rotate(-45deg);
  }

  80% {
    transform: translateY(-10px) rotate(-45deg);
  }

  100% {
    transform: translateY(0) rotate(-45deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s;
}

.slide-right-enter-from {
  transform: translateX(-100px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100px);
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s;
}

.slide-left-enter-from {
  transform: translateX(100px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100px);
  opacity: 0;
}
</style>
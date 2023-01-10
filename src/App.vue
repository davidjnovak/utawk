<template>
  <!--This template is for the welcome page-->
  <template v-if="location.access == false"> 

    <!-- This conditional is mased on initialized values so it appears automatically when loading into the page -->
    <main v-if="coordinates.lat == 0 && coordinates.lng == 0" class="local">
        <!--<h2>Please allow location to access uTawk</h2>-->
          <div class="pin"></div>
          <div class="pulse"></div>
    </main> 

    <!-- This conditional is met if the user denies the webpage access to their location -->
    <main v-else-if="coordinates.lat == 1 && coordinates.lng == 0" class="local">
        <h2>DENIED ACCESS: Please refresh page and allow location to access hawtawk</h2>
    </main>

  </template>
  
  <!--This template is the actual forum and any other potential views to be used once the user allows the webpage access to their location -->
  <template v-else-if="location.access == true">


      <header id="app-header" class="app-header">
        <img alt="Vue logo" class="logo" src="@/assets/hawkTawkLogo.png" width="125" height="125" />
        <h3 class="animate-charcter">uTawk</h3>
        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>
        <!-- These conditionals and html show to the user which school forum they're in and if they're in view only mode or not -->
        <h4 v-if="this.school.access == true" :key="componentKey1">Tawking in {{this.school.name}}</h4>
        <h4 v-else :key="componentKey2">Watching {{this.school.name}}</h4>
      
      </header>

      <RouterView />

  </template>

</template>

<script lang="js">
import { RouterLink, RouterView } from 'vue-router'
import {closest, schoolList} from './classes/distance.js'
import { ref } from 'vue'

//component keys are for labeling header portion to update curretn school info to user
const componentKey1 = ref(0)
const componentKey2 = ref(0)

//function to actually update the html for school info once the update is needed
const forceRerender = () => {
  componentKey1.value += 1
  componentKey2.value += 1
}

export default {
    data() {
        return {
          //initializing user coordinate data
            coordinates: {
                lat: 0,
                lng: 0
            },
            //initializing school info data
            school: {
                access: false,
                name: "nada"
            },
            //initializing access to users location data
            location: {
              access: false
            },
            //initializing keys for updating html
            componentKey1: 0,   
            componentKey2: 0         
        }
    },
    //initializing function for updating school info in html
    methods: {
      forceRerender() {
        this.componentKey1 += 1,
        this.componentKey2 += 1
      },
    },
    created() {
        //when page loads it automatically asks user for location access
        this.$getLocation({})

            //this code runs of the user does allow the webpage to access their location
            .then((coordinates) => {
            
            this.location.access = true //updates variable to let page know we have access to users location
          
            this.coordinates = coordinates //this saves the coordinates retrived from $getlocation to intial variables

            //all this code is for testing different coordinate locations besides users current location
            //-----------------------------------------------------------------------------------------//
            //COORDINATES FOR INSIDE UNCW
            
            this.coordinates.lat = 34.2239
            this.coordinates.lng = -77.8696

            //COORDINATES FOR INSIDE APP STATE

            //this.coordinates.lat = 36.2136
            //this.coordinates.lng = -81.6843

            //COORDINATES FOR OUTSIDE OF APP STATE

            //this.coordinates.lat = 36.0
            //this.coordinates.lng = -81.0

            //COORDINATES FOR INSIDE NC STATE

            //this.coordinates.lat = 35.7847
            //this.coordinates.lng = -78.6821

            //COORDINATES FOR OUTSIDE OF NC STATE

            //this.coordinates.lat = 35.7
            //this.coordinates.lng = -78.6
            //-----------------------------------------------------------------------------------------//


            //variables for checking user distance
            let setRadius = 3 //change this value to set radius to be able to chat 
            let values = closest(schoolList, this.coordinates.lat, this.coordinates.lng) //usses function that determines the closest school to the user

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
              alert("You are in range of our " + school +  " chatroom!")

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


header img {
  -webkit-border-radius: 20px;
  -moz-border-radius: 20px;
  border-radius: 40px;
  width: 64px;
  height: 64px;
  float: left;
  padding: 1px;
}

h3 {
  font-size: 2.6rem;
  top: 0px;
  float: left;
  font-weight: bold;
  text-transform: uppercase;
  background-clip: border-box;
  color: #fff;
  display: inline-block;
}

header h2 {
  font-weight: 50;
  font-size: 2.6rem;
  float: center;
  font-weight: bold;
  position: relative;
  top: 50px;
  left: 50px;
  color: rgb(1, 84, 84);
  text-align: center;
}
.app-header {
  display: block;
  background: rgb(0,128,128);
  background: linear-gradient(335deg, rgba(0,128,128,1) 0%, rgba(0,0,0,1) 100%);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  color: #fff;
  height: 64px;
  box-shadow: 20px 20px 50px rgba(0,0,0,0);
  border-bottom: 0px solid black;
}
header {
  line-height: 1.5;
  max-height: 100vh;
}
header h4{
  float: right;
  width: 15%;
  margin: -35px 0 0 0;
  font-style: italic;
  
}
.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  font-size: 12px;
  padding: 17px;
  
}
nav a.router-link-exact-active {
  color: white;
}
nav a.router-link-exact-active:hover {
  background-color: transparent;
}
nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid white;
  font-weight: bold;
}
nav a:first-of-type {
  border: 0;
}

header {
  display: flex;
  place-items: top;
  padding-right: calc(var(--section-gap) / 2);
  z-index: 10;
}
header a {
  color: teal;
}

.logo {
  margin: 0.75em 2rem 2em 2em;
}
@media only screen and (max-width: 520px) {
  header h4 {
    font-size: 10px;
    margin-right: 1em;
    width: 100px;
    margin-top: -28px;
  }
  .animate-charcter {
    display: none;
  }
  .app-header {
    height: 48px;
  }
  header img {
    width: 48px;
    height: 48px;
  }
  nav {
    padding: 10px;
    margin-top: 6px;
  }
  .mainpage {
    margin: 0px;
    width: 100px;
  }
  footer {
    min-width: 100vh;
  }

}
@media only screen and (max-width: 900px) and (min-width: 521px) {
  h4 {
    font-size: 12px;
  }
  .animate-charcter {
    font-size: 35px;
    margin-top: 6px;
  }
  nav {
    font-size: 8px;
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


</style>
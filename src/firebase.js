// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import 'firebase/firestore'
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCM3oqUmmOyYZl52Quvciw8TgLhU2WyCQM",
  authDomain: "hawktawk-dfaf5.firebaseapp.com",
  projectId: "hawktawk-dfaf5",
  storageBucket: "hawktawk-dfaf5.appspot.com",
  messagingSenderId: "731019105246",
  appId: "1:731019105246:web:19bde728559c82dec0034f",
  measurementId: "G-VSNNH7MDNM"
};

// Initialize Firebase
const app =  initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db
}




// const firestore = firebase.firestore()
// const postCollection = firestore.collection('posts')
// const replyCollection = firestore.collection('replies')
// const userCollection = firestore.collection('users')
// postsQuery = postCollection.order('createdAt', 'desc').limit(100)


// export function fetchUserInfo(){
//   //returns coords, userId (if exists), randomName, 
//   return 'adding Post Test'
// }

// export default function useChat() {
//   const posts = ref([])
//   const unsubscribe = postsQuery.onSnapshot(snapshot => {
//     posts.value = snapshot.docs
//       .map(doc => ({ id: doc.id, ...doc.data() }))
//       .reverse()
//   })
//   onUnmounted(unsubscribe)
//   //verification stage, make sure not spam posting, etc
//   return { posts }
// }

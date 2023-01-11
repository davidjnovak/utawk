<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { collection, addDoc, onSnapshot, doc, getDoc, updateDoc, deleteDoc, arrayRemove, arrayUnion, where, getDocs, orderBy, query, limit} from "firebase/firestore"
import { db } from '@/firebase'
import { upperCase } from "upper-case"
import { format } from 'timeago.js'
import { uniqueNamesGenerator, adjectives, colors, animals  } from "unique-names-generator"
import Cookies from "js-cookie"
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { useStore } from 'vuex'


const store = useStore() //creates variable to access vuex store
const currentCollection = store.getters.getSchoolName //gets school's database collection name variable from store 
const primarySchoolColor = ref('red')
const secondarySchoolColor = ref('orange')
const accentSchoolColor = ref('gray')


const newPostText = ref('')
const posts = ref([])
const cooldown = ref(false)
var emojiToggle = ref(false)

const cookieId = uniqueNamesGenerator({ dictionaries: [colors, adjectives, animals] })
const currentAccess = store.getters.getSchoolAccess   //gets boolean to know if user has access to school forum
const sortByTime = query(collection(db, currentCollection), orderBy('timeCreated', 'desc'), limit(200))
const sortbyVotes = query(collection(db, currentCollection), orderBy('votes', 'desc'), limit(200))
var currentSort = sortByTime



onMounted(async() => { 
    createSnapshot()
})

function createSnapshot(){
    onSnapshot( currentSort, (querySnapshot) => {
        const fbPosts: any = []
        querySnapshot.forEach((doc) => {
            const post: any = {
                id: doc.id,
                text: doc.data().text,
                displayName: doc.data().displayName,
                votes: doc.data().votes,
                timeCreated: doc.data().timeCreated,
                postReplies: doc.data().postReplies,
            }
            fbPosts.push(post)
        });
        posts.value = fbPosts
    }); 
}

async function upvote (refId, newVoteCount){
    const postRef = doc(db, 'uncwposts', refId)
    const post: any = (await getDoc(postRef)).data()
    const cookie = Cookies.get("id")
    
    if (cookie!=null){ // if user has tawked 
        if (!(post.upvoters.includes(cookie))){ // if user has not already upvoted
            if(post.downvoters.includes(cookie)){ // if user has already downvoted 
                newVoteCount += 1
            }
            newVoteCount += 1
            updateDoc(postRef, {
                votes: newVoteCount,
                upvoters: arrayUnion(cookie),
                downvoters: arrayRemove(cookie)
            })
            Cookies.set(refId, true)
        }
        else{ // undo upvote
            newVoteCount -= 1
            updateDoc(postRef, {
                votes: newVoteCount,
                upvoters: arrayRemove(cookie)
            })
            Cookies.set(refId, null)
        }
        createSnapshot()
    }
    else{alert("You need to tawk to vote!")}
}

async function downvote (refId, newVoteCount) {
    const postRef = doc(db, 'uncwposts', refId)
    const post: any = (await getDoc(postRef)).data()
    const cookie = Cookies.get("id")
    if (cookie!=null){ // if user has not tawked yet
        if (!(post.downvoters.includes(cookie))){ // if user has not already downvoted
            if (post.upvoters.includes(cookie)) { newVoteCount -= 1} // if user had previously upvoted
            newVoteCount -= 1
            updateDoc(postRef, {
                votes: newVoteCount,
                downvoters: arrayUnion(cookie),
                upvoters: arrayRemove(cookie)
            })
            Cookies.set(refId, false)
        }
        else{ // undo downvote
            newVoteCount += 1
            updateDoc(postRef, {
                votes: newVoteCount,
                downvoters: arrayRemove(cookie)
            })
            Cookies.set(refId, null)
        }
        createSnapshot()
    } 
    else{alert("You need to tawk to vote!")}

}

const changeSort = () => {
    if (currentSort==sortbyVotes){
        currentSort=sortByTime
    }
    else{
        currentSort=sortbyVotes
    }
    createSnapshot()
}

function mention(displayName){
    if (!newPostText.value.includes(displayName)){
        newPostText.value = "@" + displayName + " " +  newPostText.value
    }
}

function onSelectEmoji(emoji) {
  newPostText.value = newPostText.value + emoji.i
}

const setCooldown = () => {
    cooldown.value = true
    setTimeout(() => {
        cooldown.value = false;
    }, 5000);
}

const verifyPost = (text: string | any[]) => {
  // check for hate speech and whatnot
  if (text.length == 0){
    return false
  }
  else if (cooldown.value == true){
    alert("Please don't spam post")
    return false
  }
  else { 
    return true
  }
}

const toggleEmoji = () => {
  emojiToggle.value=(!emojiToggle.value)
}

const addPost = () => {
  if (!(verifyPost(newPostText.value))){
    return
  }
    if (Cookies.get("id")==undefined){ // first post, assign id
      Cookies.set("id", cookieId) 
    }
    const postRef = collection(db, currentCollection);
    addDoc(postRef, {
      text: newPostText.value,
      displayName: Cookies.get('id'), 
      timeCreated: new Date().setHours(new Date().getHours()),
      votes: 0,
      upvoters: [],
      downvoters: [],
    })
    createSnapshot()
    setCooldown()
    newPostText.value = ''
}

</script>

<template>
    <main>
        <body class="mainpage">
            <div class="page-content page-container" id="page-content">
                <div class="padding">
                    <div class="flip">
                        <h3 class ="trending">🔥</h3>
                        <h3 class="recent">🕑</h3>
                        <label class="switch">
                        <input type="checkbox" @click="changeSort">
                        <span class="slider round" ></span>
                        </label>
                        <div class="row">
                            <div class="list list-row block">
                                <div class="list-item" v-for ="{ id, text, displayName, votes, upvoters, downvoters, timeCreated, postReplies} in posts">
                                    <table class= "votetable">
                                        <tr>
                                            <td class="uptd"><button class="upvote" @click="upvote(id, votes)">🔼</button></td>
                                            <td class = "countbox"><div class="count">{{votes}}</div></td>
                                        </tr>
                                        <tr>
                                            <td class="downtd"><button class="downvote" @click="downvote(id, votes)">🔽</button></td>
                                            <td></td>
                                        </tr>
                                    </table>
                                    <div><a href="#" data-abc="true"><span class="w-48 avatar gradientavi">{{upperCase(displayName).substring(0,1)}}</span></a></div>
                                    <div class="flex">
                                        <div class="timestamp">tawked {{format(timeCreated, 'en_US')}}</div>
                                        <a v-if="Cookies.get('id') == displayName" href=# @click="mention(displayName)" class="item-author text-color2" data-abc="true">{{displayName}}</a>
                                        <a v-else @click="mention(displayName)" href=# class="item-author text-color" data-abc="true">{{displayName}}</a>
                                        <div class="item-except text-muted text-sm h-1x">{{text}}</div>
                                    </div>
                                    <div class="no-wrap">
                                    </div>
                                </div>
                            </div>
                            <footer v-if="currentAccess == true"> <!-- This line checks store's variable, if user has acess to school forum then they are able to see posting box and post to forum-->
                                <main>
                                    <div class="new-post-box">
                                    <div class="input-container ic1">
                                        <textarea @keydown.enter.exact.prevent="addPost" id="post" class="input" placeholder=" " v-model="newPostText" maxlength=120></textarea>
                                        <label for="post" class="placeholder">Tawk Here</label>
                                        <EmojiPicker disable-skin-tones="true" hide-search="true" theme="dark" class="picker" v-if="emojiToggle" :native="true" @select="onSelectEmoji"></EmojiPicker>
                                        <div class="charlimit">{{120 -  newPostText.length}} Characters Remaining</div>
                                    </div>
                                    <div class="bottom">
                                        <button class="emojiButton" @click="toggleEmoji()"></button>
                                        <button type="submit" class="post" id="post" @click="addPost">Post</button>
                                    </div>
                                    </div>  
                                    
                                </main>

                            </footer>
                        </div>
                    </div>

                </div>
            </div>
        </body> 
    </main>

</template>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Noto+Sans:400,700,400italic,700italic);

:root{
--primary-color: v-bind(primarySchoolColor);
--secondary-color: v-bind(secondarySchoolColor);
--accent-color: v-bind(accentSchoolColor);

}


footer{
    position: fixed;
    bottom: 1%;
    z-index: 1000;
    animation: 1s ease-out 0s 1 slideInFromBottom;
    width: 85%;
    max-width: 1000px;
    margin-left: 3%;
}

@keyframes slideInFromBottom {
    0% {
        transform: translateY(0%);
    }
    50% {
        transform: translateY(-3%);
    }
    100% {
        transform: translateY(0%);
    }
}

.text-color2 {
    color: var(--primary-color);
    font-weight: bold;
}
.yourpostrow .yourposts{
    -ms-flex-direction: row;
    flex-direction: row;
    -ms-flex-align: center;
    align-items: center;
    
}

.yourpostrow .yourposts>*{
    padding-right: .625rem;
    padding-left: .625rem;
    
}
.yourposts {
    position: relative;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    animation: fadeInAnimation ease 3s;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
    
}

.mainpage {
    margin: 5em auto;
    width: 90%;
    margin-bottom: 180px;
}

body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: .875rem;
    font-weight: 400;
    line-height: 1.4285714286;
    color: #393838;
    text-align: left;
    animation: fadeInAnimation ease 3s;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
}

@keyframes fadeInAnimation {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

#page-content{
    margin-top:10px;
}

.text-muted {
    color: #f7f7f7!important
}

.block,
.card {
    background: #303030;
    border-width: 0;
    border-radius: .25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .05);
    margin-bottom: 1.5rem
}
.timestamp{
    color:gray;
}
.avatar {
    position: relative;
    line-height: 1;
    border-radius: 500px;
    white-space: nowrap;
    font-weight: 700;
    border-radius: 100%;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: center;
    justify-content: center;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    border-radius: 500px;
    box-shadow: 0 2px 20px 0 rgb(0, 0, 0);
    color: rgb(252, 252, 99);
    font-size: 22px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 0 #ccc,
    0 6px 1px rgba(0,0,0,.1),
    0 0 5px rgba(0,0,0,.1),
    0 1px 3px rgba(0,0,0,.3),
    0 3px 5px rgba(0,0,0,.2),
    0 5px 10px rgba(0,0,0,.25),
    0 10px 10px rgba(0,0,0,.2),
    0 20px 20px rgba(0,0,0,.15);
}

.avatar img {
    border-radius: inherit;
    width: 100%
}


.gradientavi {
    color: rgb(255, 255, 255);
    border: none;
    background: #fefefe linear-gradient(50deg, var(--primary-color), var(--accent-color))
}


@media (min-width:992px) {
    .page-container {
        max-width: 1140px;
        margin: 0 auto
        
    }
    .page-sidenav {
        display: block!important
    }
}


.list {
    padding-left: 0;
    padding-right: 0
}

.list-item {
    position: relative;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    animation: fadeInAnimation ease 3s;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
}
.user-list-item {
    position: relative;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    min-width: 0;
    animation: fadeInAnimation ease 3s;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
}

@keyframes fadeInAnimation {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
.list-row .list-item {
    -ms-flex-direction: row;
    flex-direction: row;
    -ms-flex-align: center;
    align-items: center;
    padding: .75rem .625rem
}

.list-row .list-item>* {
    padding-left: .625rem;
    padding-right: .625rem
}
.no-wrap {
    white-space: nowrap
}
.text-color {
    color: white;
    font-weight: bold;
}


.text-gd {
    -webkit-background-clip: text;
    -moz-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    -moz-text-fill-color: transparent;
}
.text-sm {
    font-size: .825rem
}

.h-1x {
    height: 1.25rem;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}

.w-48 {
    width: 48px!important;
    height: 48px!important
}


a:link{
    
    text-decoration: none;
}
.upvote {
    font-size: 20px;
    background: none;
    border: none;
    cursor: pointer;

}
.upvotePressed {
    font-size: 22px;
    background-color:rgb(39, 208, 39);
    border-radius: 50px;
}

.count{
    font-family: Helvetica;
    font-weight: bold;
    color: #f7f7f7;
    text-align: center;
}

.countbox {
    position: relative;
    top: 20px;
    text-align: center;
}
.downvote {
    font-size: 20px;
    background: none;
    border: none;
    cursor: pointer;
}

.downvote:hover {
    background-color: rgb(186, 83, 83);
    border-radius: 50px;
}

.downvote:active, .downvote:focus {
    border-radius: 50px;
}
.upvote:hover{
    background-color:rgb(106, 180, 106);
    border-radius: 50px;
}

.upvote:focus {
    border-radius: 50px;
}

@keyframes bump {
    30% { transform: scale(1.5); }
}

.votetable, tr, td {
    border: 1px solid;
    color: rgba(255, 255, 255, 0);
    
}

.votetable {
    width: 105px;

}


.uptd, .downtd {
    width: 32px;
}

.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
    margin: 1em;
    margin-left: 27px;
}

.switch input { 
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgb(101, 101, 101);
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked + .slider {
    background-color: rgb(118, 118, 118);
}

input:focus + .slider {
    box-shadow: 0 0 1px rgb(216, 215, 215);
}

input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}

.padding h3 {
    position: absolute;
    margin-left: 90px;
    margin-top: 18px;
    color: teal;
}

.padding .recent {
    font-size: 20px;
    margin-left: 0;
}
.padding .trending{
    margin-right: 0px;
    font-size: 20px;
}
.timestamp{
    font-size: smaller;
    color: rgb(119, 115, 115);
}

@media only screen and (max-width: 520px) {
    .mainpage {
        margin: 0px;
        width: 100%;
    }
    footer {
        bottom: 0;
        position: sticky;
        margin: 0 auto;
        width: 100%;
    }
    
    .list-row .list-item>* {
        padding-left: .3rem;
        padding-right: .3rem
    }
    
    .votetable {
        width: 84px;
    }
    
    .uptd, .downtd {
        width: 16px;
    }

    .flex {
        width: 240px;
    }

    .emojiButton {
        display: none;
    }
    
    .switch {
    width: 30px;
    height: 17px;
    margin: 1em;
    margin-top: 4em;
    margin-left: 37px;
    }
    
    .slider:before {
        height: 13px;
        width: 13px;
        left: 2px;
        bottom: 2px;
    }
    
    .slider.round {
        border-radius: 17px;
    }
    
    input:checked + .slider:before {
        -webkit-transform: translateX(13px);
        -ms-transform: translateX(13px);
        transform: translateX(13px);
    }
    
    .padding h3 {
        position: absolute;
        margin-left: 70px;
        margin-top: 4.3em;
        color: var(--primary-color);
        font-size: 10px;
    }

    .padding .recent {
        font-size: 13px;
        margin-left: 18px;
    }
    .padding .trending{
        margin-right: 0px;
        font-size: 13px;
    }
    
    .padding .Trending {
        margin-left: 140px;
    }

    h3.recent {
        font-size: 10px;
        margin-left: 40px;
    }


    #app {
        padding: 0rem;
    }
    
    .w-48 {
        width: 32px!important;
        height: 32px!important
    }
    
    .avatar {
        font-size: 14px;
    }
    
    .upvote, .downvote {
        font-size: 14px;
    }
    
    .countbox {
        top: 12px;
    }
    
    .timestamp {
        font-size: 10px;
    }
    
    .list-item {
        font-size: 12px;
    }
    
    .item-except {
        font-size: 12px;
        margin-inline-end: 1em;    /* relative to the text size */
    }
    
    
}


.filtertawks{
    position: relative;
    line-height: 1;
    border-radius: 500px;
    white-space: nowrap;
    font-weight: 700;
    border-radius: 100%;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: right;
    justify-content: rught;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    border-radius: 500px;
    color: rgb(252, 252, 99);
    font-size: 22px;
    text-transform: uppercase;
    font-style: italic;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 0 #ccc,
    0 6px 1px rgba(0,0,0,.1),
    0 0 5px rgba(0,0,0,.1),
    0 1px 3px rgba(0,0,0,.3),
    0 3px 5px rgba(0,0,0,.2),
    0 5px 10px rgba(0,0,0,.25),
    0 10px 10px rgba(0,0,0,.2),
    0 20px 20px rgba(0,0,0,.15); 
}

/* NewPost Styling */

.picker{
  position: absolute;
  bottom:4em;
  right: 0;
}
.emojiButton {
  cursor: pointer;
  position: absolute;
  right: 2em;
  bottom: 1.6em;
  background-image: url('../src/assets/grin.png');
  width: 2.8em;
  height: 2.8em;
  border: none;
  background-color: transparent;
  background-repeat: no-repeat;
}
.new-post-box {
  background-color: #303030;
  border-radius: 20px;
  box-sizing: border-box;
  height: 170px;
  position: sticky;
  z-index: 10;
  padding: 20px;
  box-shadow: 5px 5px 10px 2px rgba(0,0,0,.8);
  width: inherit;
}

.title {
  color: #eee;
  font-size: 36px;
  font-weight: 600;
  margin-top: 30px;
}
.subtitle {
  color: #eee;

  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
}
.input-container {
  height: 60px;
  position: relative;
  width: 100%;
}
.ic1 {
  margin-top: 10px;
}
.ic2 {
  margin-top: 30px;
}
.input {
  background-color: #555555;
  border-radius: 20px;
  border: 0;
  box-sizing: border-box;
  color: #eee;
  font-size: 18px;
  height: 100%;
  outline: 0;
  padding: 4px 20px 0;
  width: 100%;
}
.cut {
  background-color: #303030;
  border-radius: 10px;
  height: 20px;
  left: 20px;
  position: absolute;
  top: -20px;
  transform: translateY(0);
  transition: transform 200ms;
  width: 76px;
}
.cut-short {
  width: 50px;
}
.input:focus ~ .cut,
.input:not(:placeholder-shown) ~ .cut {
  transform: translateY(8px);
}
.placeholder {
  color: #303030;

  left: 20px;
  line-height: 14px;
  pointer-events: none;
  position: absolute;
  transform-origin: 0 50%;
  transition: transform 200ms, color 200ms;
  top: 20px;
}
.input:focus ~ .placeholder,
.input:not(:placeholder-shown) ~ .placeholder {
  transform: translateY(-30px) translateX(10px) scale(0.75);
}
.input:not(:placeholder-shown) ~ .placeholder {
  color: #040404;
}
.input:focus ~ .placeholder {
  color: #fff;
}
.bottom {
  display: flex;
  margin-top: 29px;
  align-items: center;
  justify-content: space-between;
}
.bottom .post{
  background-color: #cc8446;
  border-radius: 20px;
  border: 0;
  box-sizing: border-box;
  color: #eee;
  cursor: pointer;
  font-size: 18px;
  height: 35px;
  margin-top: 1px;
  margin-bottom: 1px;
  text-align: center; 
  width: 25%;
}
.post:active {
  background-color: white;
}
.post:hover {
  background: var(--primary-color);
}
.charlimit{
  font-size: smaller;
  color: #555555;
}

</style>
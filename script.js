// ===============================
// FerroBloggers AI
// script.js
// ===============================

// Elementos
const chat = document.getElementById("chat");
const prompt = document.getElementById("prompt");
const sendButton = document.getElementById("sendButton");
const typing = document.getElementById("typing");

const themeButton = document.getElementById("themeButton");

const profileButton = document.getElementById("profileButton");
const profileModal = document.getElementById("profileModal");
const saveProfile = document.getElementById("saveProfile");

const botName = document.getElementById("botName");
const botDescription = document.getElementById("botDescription");
const profileAvatar = document.getElementById("profileAvatar");
const avatarInput = document.getElementById("avatarInput");

const historyList = document.getElementById("historyList");
const newChat = document.getElementById("newChat");

// Cambia esta URL cuando tengas tu backend
const API_URL = "https://TU-BACKEND.up.railway.app/api/chat";

// Historial de mensajes
let messages = [];

// ---------- Perfil ----------

function loadProfile() {

    const profile = JSON.parse(localStorage.getItem("ferroProfile"));

    if (!profile) return;

    botName.value = profile.name;

    botDescription.value = profile.description;

    if(profile.avatar){
        profileAvatar.src = profile.avatar;

        document.querySelectorAll(".avatar").forEach(a=>{
            a.src = profile.avatar;
        });

        document.querySelector(".logo img").src = profile.avatar;
    }

}

saveProfile.onclick = ()=>{

    const profile = {

        name:botName.value,

        description:botDescription.value,

        avatar:profileAvatar.src

    };

    localStorage.setItem("ferroProfile",JSON.stringify(profile));

    alert("Perfil guardado.");

    profileModal.style.display="none";

}

profileButton.onclick=()=>{

    profileModal.style.display="flex";

}

window.onclick=(e)=>{

    if(e.target===profileModal)

        profileModal.style.display="none";

}

avatarInput.onchange=(e)=>{

    const file=e.target.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=()=>{

        profileAvatar.src=reader.result;

    }

    reader.readAsDataURL(file);

}

// ---------- Tema ----------

if(localStorage.getItem("theme")==="light"){

    document.body.classList.add("light");

    themeButton.innerHTML="☀️";

}

themeButton.onclick=()=>{

    document.body.classList.toggle("light");

    if(document.body.classList.contains("light")){

        localStorage.setItem("theme","light");

        themeButton.innerHTML="☀️";

    }else{

        localStorage.setItem("theme","dark");

        themeButton.innerHTML="🌙";

    }

}

// ---------- Chat ----------

function addMessage(text,role){

    const div=document.createElement("div");

    div.className="message "+role;

    div.innerHTML=`
        <div class="bubble">${text}</div>
    `;

    chat.appendChild(div);

    chat.scrollTop=chat.scrollHeight;

}

async function sendMessage(){

    const text=prompt.value.trim();

    if(!text) return;

    addMessage(text,"user");

    messages.push({

        role:"user",

        content:text

    });

    prompt.value="";

    typing.style.display="block";

    try{

        const res=await fetch(API_URL,{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                messages

            })

        });

        const data=await res.json();

        typing.style.display="none";

        addMessage(data.reply,"ai");

        messages.push({

            role:"assistant",

            content:data.reply

        });

        saveConversation();

    }catch{

        typing.style.display="none";

        addMessage("❌ No fue posible conectar con FerroBloggers AI.","ai");

    }

}

sendButton.onclick=sendMessage;

prompt.addEventListener("keydown",(e)=>{

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();

        sendMessage();

    }

});

// ---------- Conversaciones ----------

function saveConversation(){

    let chats=JSON.parse(localStorage.getItem("ferroChats")) || [];

    chats.unshift({

        title:messages[0]?.content || "Nueva conversación",

        messages,

        date:new Date().toLocaleString()

    });

    localStorage.setItem("ferroChats",JSON.stringify(chats));

    loadHistory();

}

function loadHistory(){

    historyList.innerHTML="";

    const chats=JSON.parse(localStorage.getItem("ferroChats")) || [];

    chats.forEach(chatData=>{

        const li=document.createElement("li");

        li.textContent=chatData.title;

        li.onclick=()=>{

            chat.innerHTML="";

            messages=chatData.messages;

            messages.forEach(msg=>{

                addMessage(msg.content,msg.role==="user"?"user":"ai");

            });

        };

        historyList.appendChild(li);

    });

}

newChat.onclick=()=>{

    messages=[];

    chat.innerHTML="";

}

// ---------- Inicio ----------

loadProfile();

loadHistory();

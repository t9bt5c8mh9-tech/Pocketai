const $ = id => document.getElementById(id);
const status = $('status'), statusDot = $('statusDot'), form = $('chatForm'), prompt = $('prompt'), sendButton = $('sendButton'), messages = $('messages'), conversation = $('conversation'), welcome = $('welcome'), newChat = $('newChat'), loadButton = $('loadButton');
let history = [], busy = false;
function setStatus(message, kind='') {status.textContent=message;statusDot.className=`dot ${kind}`;}
function controls(){prompt.disabled=busy;sendButton.disabled=busy||!prompt.value.trim();}
function addMessage(who, content){const item=document.createElement('div');item.className=`message ${who==='You'?'user':'bot'}`;const speaker=document.createElement('span');speaker.className='speaker';speaker.textContent=who;const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=content;item.append(speaker,bubble);messages.append(item);conversation.scrollTop=conversation.scrollHeight;}
welcome.hidden=true;loadButton.hidden=true;prompt.placeholder='Ask Pocket Chat anything…';setStatus('Cloud AI · checking connection…','busy');
fetch('./api/chat').then(async r=>{if(!r.ok)throw Error();setStatus('Cloud AI ready','ready');}).catch(()=>setStatus('Cloud AI not connected · deploy on Cloudflare Pages','error'));
form.addEventListener('submit',async e=>{e.preventDefault();const text=prompt.value.trim();if(busy||!text)return;addMessage('You',text);history.push({role:'user',content:text});prompt.value='';busy=true;controls();setStatus('Thinking…','busy');try{const response=await fetch('./api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history.slice(-12)})});const data=await response.json();if(!response.ok||!data.answer)throw Error(data.error||'AI unavailable');addMessage('AI',data.answer);history.push({role:'assistant',content:data.answer});setStatus('Cloud AI ready','ready');}catch(err){addMessage('System','Could not reach the cloud AI. '+err.message);history.pop();setStatus('AI connection error','error');}finally{busy=false;controls();prompt.focus();}});
prompt.addEventListener('input',()=>{prompt.style.height='auto';prompt.style.height=`${Math.min(prompt.scrollHeight,132)}px`;controls();});
prompt.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!sendButton.disabled)form.requestSubmit();}});
newChat.addEventListener('click',()=>{history=[];messages.replaceChildren();prompt.value='';controls();});
// Remove the old offline cache so updated app.js is fetched after deployment.
if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));
controls();

const chatForm = document.querySelector('#chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.querySelector('#room-name')
const userList = document.querySelector('#users')
//Get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

const socket = io()

//Join chatroom
socket.emit('joinRoom', { username, room })

//Get room info and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputRoomUsers(users)
})

//Message from server
socket.on('message', message => {
  outputMessage(message)

  //Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

//Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  //Get message text
  const msg = e.target.elements.msg.value

  //Emit message to server
  socket.emit('chatMessage', msg)

  //Clear input
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

//Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                  <p clss="text">
                    ${message.text}
                  </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

// Add Roomname to DOM
function outputRoomName(room) {
  roomName.innerText = room
}

// Add users to DOM
function outputRoomUsers(users) {
  userList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}`
}
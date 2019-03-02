document.getElementById('chat-form').addEventListener('submit', onChatFormSubmit);

function onChatFormSubmit (e) {
  e.preventDefault();
  const value = document.getElementById('chat-input').value;
  if (!value) return;
  document.getElementById('chat-input').value = '';
  socket.emit('message', { roomName: 'global', message: value });
}

/*async function socketConnect (io) {
  const socket = io('http://localhost:3000');
  return socket;
}*/

async function getLoggedUsers () {
  const users = await axios('/users')
    .then(resp => resp.data)
    .catch(e => console.log('-e-', e));
  console.log('-users-', users);
  const list = document.getElementById('user-list');
  users.forEach(user => {
    const el = document.createElement('li');
    el.style.cssText = 'font-size:11px; list-style-type: none; padding-left: 5px;';
    const textNode = document.createTextNode(`${user.name}`);
    el.appendChild(textNode);
    list.appendChild(el);
  });
  return users;
}
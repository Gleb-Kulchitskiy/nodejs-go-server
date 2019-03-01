document.getElementById('chat-form').addEventListener('submit', onChatFormSubmit);

function onChatFormSubmit (e) {
  e.preventDefault();
  const value = document.getElementById('chat-input').value;
  const messageList = document.getElementById('message-list');
  const li = document.createElement('li');
  const textNode = document.createTextNode(value);
  li.appendChild(textNode);
  messageList.appendChild(li);
}

/*async function socketConnect (io) {
  const socket = io('http://localhost:3000');
  return socket;
}*/

function getLoggedUsers () {
  axios('/users')
    .then(resp => console.log('-resp-', resp.data))
    .catch(e => console.log('-e-', e));

}
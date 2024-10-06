//login 
document.getElementById('loginForm').addEventListener('submit', async(event)=>{
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  if(!email || !password){
    alert('Please enter both email and password');
    return;
  }
  const {data} = await axios.post(`https://to-do-list-backend-rd9g.onrender.com/auth/login`, {email, password})
  localStorage.setItem('token', data.token);
  window.location.href = '/index.html';
  console.log(data)
})


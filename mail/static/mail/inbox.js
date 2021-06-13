// add event listener to loading all the contents
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('button').forEach(button => {
    button.onclick = function () {
      const view = this.dataset.view;
      //console.log(`button clicked : ${view}\nhistory push state : ${view}\nurl updating : /${view}`);
      //history.pushState({view:`${view}`},'',`/${view}`);
      if(view == "compose") {
        console.log('compose is active');
        compose();
      }
      else if (view == "close") {
        close();
      }
      else {
        console.log('loading mailbox');
        load_mailbox(view);
      }
    }
  })

  if(document.querySelector('#close')){
    document.querySelector('#close').addEventListener('click', () => {
      close();
    });
  }
  

  // by default inbox is loaded
  //history.pushState({view:'inbox'},'','');
  load_mailbox('inbox');
});

// browser buttons behaviour setting
/*
window.onpopstate = function (event) {
  if(event.state.view == 'compose'){
    console.log(`onpopstate expected - in compose, found : ${event.state.view}`);
    compose();
  }
  else {
    console.log(`onpopstate expected - in mailbox, found : ${event.state.view}`);
    load_mailbox(event.state.view);
  }
}
*/
/*
var currentPath='/', currentView='/', lastSegment=false, unloadFlag=0;
window.addEventListener('beforeunload', function (event){
  currentView = history.state.view;
  console.log(`current view or state : ${currentView}`);
  currentPath = location.pathname;
  lastSegment = location.pathname.split("/").pop();
  console.log(`last segment : ${lastSegment}`);
  console.log(`current path : ${currentPath}`);
  history.replaceState({view: 'inbox'},'','/');
  console.log(`replaced state : ${history.state.view}`);
  unloadFlag=1;
})


window.addEventListener('load', function (event) {
  if(unloadFlag==1){
    console.log(`current view or state : ${history.state.view}`);
    history.state.view = currentView;
    history.replaceState({view: currentView},'',currentPath);
    console.log(`replaced state : ${history.state.view}`);
    location.pathname = currentPath;
    console.log(`replaced pathname : ${location.pathname}`);
    if(currentView=='compose'){
      if(lastSegment=='reply'){
        compose(null,true);
      }
      else if (lastSegment=='forward'){
        compose(null,false,true);
      }
      else {
        compose();
      }
    }
    else {
      if(lastSegment){
        showMail(lastSegment,currentView);
      }
      else {
        load_mailbox(currentView);
      }
    }
    currentPath='/', currentView='/', lastSegment=false, unloadFlag=0;
  }
})*/

// close button functioning
function close() {
  let status_box = document.querySelector('.status-box');
  status_box.style.display = 'none';
  document.querySelector('#emails-view').removeChild(status_box);
}

// individual email page
function showMail(email_id,mailbox,status_box) {
  let emails_view = document.querySelector('#emails-view'),
  page_view = document.createElement('div'),
  profile_pic = document.createElement('div'),
  page_sender = document.createElement('div'),
  page_recipient = document.createElement('div'),
  page_timestamp = document.createElement('div'),
  page_subject = document.createElement('div'),
  page_body = document.createElement('div'),
  button_wrap = document.createElement('div'),
  fa_icon = document.createElement('i'),
  forward = document.createElement('button'),
  reply = document.createElement('button');
  reply.innerHTML = "Reply" + ' <i class="fa fa-reply fa-sm"></i> ';
  fa_icon.className = "fa fa-user-circle fa-4x";
  forward.innerHTML = "Forward" + ' <i class="fa fa-forward fa-sm"></i> ';
  reply.className = "btn btn-sm btn-primary page-buttons";
  forward.className = "btn btn-sm btn-primary page-buttons forward";
  profile_pic.append(fa_icon);
  emails_view.innerHTML = '';
  if(status_box) {
    emails_view.append(status_box);
  }

  emails_view.append(page_view);
  page_view.append(profile_pic);
  page_view.append(page_subject);
  page_view.append(page_sender);
  page_view.append(page_recipient);
  page_view.append(page_timestamp);
  page_view.append(page_body);
  page_view.append(button_wrap);
  button_wrap.append(reply);
  button_wrap.append(forward);

  profile_pic.className = "page-profile-pic";
  page_view.className = "page";
  page_subject.className = "page-subject";
  page_sender.className = "page-sender";
  page_recipient.className = "page-recipient";
  page_timestamp.className = "page-timestamp";
  page_body.className = "page-body";
  button_wrap.className = "page-btns-wrap";

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

    if(mailbox == 'sent'){
      page_recipient.innerHTML = "<b>To : </b>" + email.recipients;
      page_sender.innerHTML = "<b>From Me : </b>" + email.sender;
    }
    else {
      if (mailbox == "inbox") {
        if (email.archived === false) {
          var archive = document.createElement('button');
          archive.innerHTML = 'Archive' + ' <i class="fa fa-archive fa-sm"></i> ';
          archive.className = "btn btn-sm btn-primary page-buttons archive";
        }
      }
      page_recipient.innerHTML = "<b>To me : </b>" + document.querySelector('#head-email-id').innerHTML;
      page_sender.innerHTML = "<b>From : </b>" + email.sender;
    }

    page_timestamp.innerHTML = `<b>${email.timestamp}</b>`;
    page_subject.innerHTML = `<b>${email.subject}</b>`;
    page_body.innerHTML = email.body;

    if(email.read === false) {
      read_it(email.id);
    }

    forward.addEventListener('click',() => {
      //console.log('forward is clicked');
      //history.pushState({view:'compose'},'','/compose/forward');
      compose(email,false,true);
    })

    reply.addEventListener('click',() => {
      console.log('clicked compose reply');
      //history.pushState({view:'compose'},'','/compose/reply');
      compose(email,true);
    });

    if(mailbox == 'inbox'){
      if (email.archived === false){
        button_wrap.append(archive);
        archive.addEventListener('click', ()=> {
          archive_it(email.id);
          let result = {
            message : "Email archived successfully!"
          }
          let confirm_status = request_status(result);
          showMail(email.id,mailbox,confirm_status);
        });
      }
    }
  });
}

function read_it(mail_id) {
  var confirm_status;
  fetch(`/emails/${mail_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  .then(response => response)
  .then(result => {
    console.log(result);
    if(result){
      confirm_status = request_status(result);
    }
  });
  if(confirm_status) {
    return confirm_status;
  }
}

function archive_it(mail_id) {
  var confirm_status;
  fetch(`/emails/${mail_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(response => response)
  .then(result => {
    console.log(result);
    if(result){
      confirm_status = request_status(result);
    }
  });
  if(confirm_status) {
    return confirm_status;
  }
}

// loading mailbox from server
function load_mailbox(mailbox) {
  document.querySelector('#emails-view').innerHTML = '';

  // switching to email view
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // fetch mailbox from server
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //console.log(emails);
    load_emails(emails,mailbox);
  });
}

// loading emails to emails view
function load_emails(emails,mailbox) {
  emails.forEach(mail => {

    const email = document.createElement('div'),
    sender = document.createElement('div'),
    subject = document.createElement('div'),
    timestamp = document.createElement('div'),
    read = mail.read;

    sender.innerHTML = mail.sender;
    subject.innerHTML = mail.subject;
    timestamp.innerHTML = mail.timestamp;

    email.append(sender);
    email.append(subject);
    email.append(timestamp);

    email.dataset.email_id = mail.id;
    email.className = "email row";
    sender.className = "email-div email-sender";
    subject.className = "email-div email-subject";
    timestamp.className = "email-div email-timestamp";

    if(read === true){
      email.style.background = 'background: rgb(250, 250, 250)';
    }

    document.querySelector('#emails-view').append(email);

    // click behaviour to email
    email.addEventListener('click', function(){ 
      //console.log(`email is clicked\npushing history ${mailbox}/${mail.id}`);
      //history.pushState({view: `${mailbox}/${mail.id}`},'',`${mailbox}/${mail.id}`);
      showMail(mail.id,mailbox);
    });
  });
}

// compose new email
function compose(email,reply,forward) {
  // switching to compose view
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (email) {
    if(reply) {
      // Auto fill some fields
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    }
    else if (forward) {
      // Auto fill some fields
      document.querySelector('#compose-recipients').value = '';
      document.querySelector('#compose-subject').value = `Fwd: ${email.subject}`;
      document.querySelector('#compose-body').value = `--------- Forwarded Message ---------\nFrom ${email.sender}\nOn ${email.timestamp}\nSubject ${email.subject}\nTo ${email.recipients}\n${email.body}`;
    }
  }
  else {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

  // adding event listener to compose form submit
  document.querySelector('#compose-recipients').focus;

  // recipient suggestion
  /*fetch('emails/user')
  .then(response => response.json())
  .then(users => {
    console.log(`users are : ${users.users}`)
    document.querySelector('#compose-recipients').onkeyup = ()=>{
      let r_value = document.querySelector('#compose-recipients').value
      console.log(r_value)
    }
  })*/

  document.querySelector('#compose-form').addEventListener('submit', send);
}

// send email to server
function send() {
  // getting values of compose form fields
  recipients = document.querySelector('#compose-recipients').value;
  subject = document.querySelector('#compose-subject').value;
  body = document.querySelector('#compose-body').value;
  let confirm_status;

  // sending values to server
  fetch('emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    //console.log(`post response : ${result}`);
    // request confirmation status
    confirm_status = request_status(result);
    return confirm_status;
  });

}

// request confirmation status
function request_status(result) {
  
  // creating status box
  const statusbox = document.createElement('div');
  let close = document.createElement('button'),
  bar1 = document.createElement('i'),
  bar2 = document.createElement('i');

  if (result.error) {
    statusbox.className = "bg-danger";
    statusbox.innerHTML = `Error : ${result.error}`;
  }
  else {
    statusbox.className = "bg-success";
    statusbox.innerHTML = `Message : ${result.message}`;
  }

  // setting attributes
  statusbox.classList += " status-box text-white";
  statusbox.append(close);
  close.className = "close-cross text-white bg-primary btn btn-sm";
  close.dataset.view = "close";
  close.innerHTML = `Close`;
  bar1.className = "cross-bar bar1";
  bar2.className = "cross-bar bar2";
  close.append(bar1);
  close.append(bar2);

  return statusbox;
}
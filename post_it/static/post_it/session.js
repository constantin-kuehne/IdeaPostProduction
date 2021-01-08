var newSessionModal = document.getElementById("newSessionModal");

var newSessionBtn = document.getElementById("newSession");

var newSessionClose = document.getElementById("newSessionClose");

var addUserModals = document.getElementsByClassName("addUserModal")

var addUserButtons = document.getElementsByClassName("addMember");

var addUserCloses = document.getElementsByClassName("addUserClose")

var currentMembersModals = document.getElementsByClassName("currentMembersModal")

var currentMembersButtons = document.getElementsByClassName("currentMembers")

var currentMembersCloses = document.getElementsByClassName("currentMembersClose")

var darker = document.getElementById("darker")

newSessionBtn.onclick = function() {
  newSessionModal.style.display = "block";
}

for (let addUserButton of addUserButtons) {
  addUserButton.onclick = function() {
    addUserButton.parentElement.childNodes[1].style.display = "block"
    darker.style.display = "block"
  }
}

for (let currentMembersButton of currentMembersButtons) {
  currentMembersButton.onclick = function() {
    currentMembersButton.parentElement.childNodes[1].style.display = "block"
    darker.style.display = "block"
  }
}

newSessionClose.onclick = function() {
  newSessionModal.style.display = "none";
}

for (let addUserClose of addUserCloses) {
  addUserClose.onclick = function() {
    addUserClose.parentElement.parentElement.style.display = "none"
    darker.style.display = "none"
  }
}

for (let currentMembersClose of currentMembersCloses) {
  currentMembersClose.onclick = function() {
    currentMembersClose.parentElement.parentElement.style.display = "none"
    darker.style.display = "none"
  }
}

window.onclick = function(event) {
  if (event.target == newSessionModal) {
    newSessionModal.style.display = "none";
  }
  if (event.target == darker) {
    for (let addUserModal of addUserModals) {
      addUserModal.style.display = "none"
      darker.style.display = "none"
    }
    for (let currentMembersModal of currentMembersModals) {
      currentMembersModal.style.display = "none"
      darker.style.display = "none"
    }
  }
}

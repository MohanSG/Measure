const passwordInput = document.querySelector(".passwordInput");
const icon = document.querySelector(".visible-icon");
const button = document.querySelector(".register-button");
const registerEmail = document.querySelector(".register-email");

button.disabled = true;
button.querySelector(".front").style.backgroundColor = "gray";

let passwordValidated = false;
let emailValidated = false;

//Change visibility of password input
function toggleVisible() {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.src = "/images/icons/eye.svg";
  } else {
    passwordInput.type = "password";
    icon.src = "/images/icons/eye-closed.svg";
  }
}

//Validation for passwords, one uppercase and lowercase letter, one digit, one special character and should be more than 8 characters
function validatePassword(pw) {
  return (
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw) &&
    pw.length > 8
  );
}

function validateEmail(email) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailValidated = true;
    document.querySelector(".vl-email").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    emailValidated = false;
    document.querySelector(".vl-email").style.color = "red";
  }
}

function checkValidation(pw) {
  if (/[A-Z]/.test(pw)) {
    console.log("Uppercase");
    document.querySelector(".vl-upper").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-upper").style.color = "red";
  }

  if (/[a-z]/.test(pw)) {
    console.log("Lowercase");
    document.querySelector(".vl-lower").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-lower").style.color = "red";
  }

  if (/[0-9]/.test(pw)) {
    console.log("Number");
    document.querySelector(".vl-number").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-number").style.color = "red";
  }

  if (/[^A-Za-z0-9]/.test(pw)) {
    console.log("Symbol");
    document.querySelector(".vl-symbol").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-symbol").style.color = "red";
  }

  if (pw.length > 8) {
    document.querySelector(".vl-length").style.color =
      "hsla(116, 96%, 60%, 1.00)";
  } else {
    document.querySelector(".vl-length").style.color = "red";
  }
}

registerEmail.addEventListener("keyup", () => {
  validateEmail(registerEmail.value);
  checkEmailPassword();
});

//Checks password strength after each key up. Changes password input border color accordingly
passwordInput.addEventListener("keyup", () => {
  checkValidation(passwordInput.value);
  if (passwordInput.value === "") {
    passwordInput.style.border = "none";
  } else if (validatePassword(passwordInput.value)) {
    passwordValidated = true;
    passwordInput.style.border = "hsla(116, 96%, 60%, 1.00) 5px solid";
    checkEmailPassword();
  } else {
    passwordValidated = false;
    passwordInput.style.border = "red 5px solid";
    checkEmailPassword();
  }
});

function checkEmailPassword() {
  if (emailValidated && passwordValidated) {
    button.disabled = false;
    button.querySelector(".front").style.backgroundColor = "white";
  } else {
    button.disabled = true;
    button.querySelector(".front").style.backgroundColor = "gray";
  }
}

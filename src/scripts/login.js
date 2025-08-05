const loginIdentifierInput = document.getElementById("identifier");
const loginPasswordInput = document.getElementById("login-password");
const loginIdentifierWarning = document.querySelector(
  ".login-identifier-warning"
);
const loginPasswordWarning = document.querySelector(".login-password-warning");
const loginBtn = document.querySelector(".login-box__login-btn");
const hideLoginPasswordBtn = document.querySelector(".hide-password-login");

let passwordIsHidden = true;

export const initUserLogin = function () {
  loginIdentifierInput.addEventListener("input", function () {
    loginIdentifierWarning.classList.add("hidden");
  });

  loginPasswordInput.addEventListener("input", function () {
    loginPasswordWarning.classList.add("hidden");
  });

  hideLoginPasswordBtn.addEventListener("click", function () {
    passwordIsHidden = !passwordIsHidden;

    if (passwordIsHidden) {
      this.innerHTML = '<ion-icon name="eye-off"></ion-icon>';
      loginPasswordInput.type = "password";
    } else {
      this.innerHTML = '<ion-icon name="eye"></ion-icon>';
      loginPasswordInput.type = "text";
    }
  });

  loginBtn.addEventListener("click", function () {
    const identifier = loginIdentifierInput.value;
    const password = loginPasswordInput.value;

    if (identifier.trim() === "") {
      loginIdentifierWarning.textContent = "Username or email is required!";
      loginIdentifierWarning.classList.remove("hidden");
      return;
    }

    if (password.trim() === "") {
      loginPasswordWarning.textContent = "Password is required!";
      loginPasswordWarning.classList.remove("hidden");
      return;
    }

    if (password.length > 0 && password.length < 8) {
      loginPasswordWarning.textContent =
        "Invalid Password! (Must be 8 characters long)";
      loginPasswordWarning.classList.remove("hidden");
      return;
    }
  });
};

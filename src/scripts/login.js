import {
  changeName,
  changePassword,
  changeProfileImage,
  data,
  logoutUser,
  removeProfileImage,
  requestOTP,
  resetPassword,
  sendLoginInfo,
  sendSignupInfo,
  verifyOTP,
  windowManager,
} from "./serverConnection.js";
import {
  passwordValidator,
  isValidEmail,
  isValidUsername,
  isValidName,
  fileSizeConverter,
  otpCountDownTimer,
} from "./utilities.js";

const loadingText = document.querySelector(".loading-window__text");
const errorText = document.querySelector(".error-window__text");
const confirmText = document.querySelector(".confirmation-window__text");
const loginBox = document.querySelector(".login-box");
const signupBox = document.querySelector(".signup-box");
const loginBoxBtn = document.querySelector(".btn-loginbox");
const signupBoxBtn = document.querySelector(".signup-toggle");

const loginIdentifierInput = document.getElementById("identifier");
const loginPasswordInput = document.getElementById("login-password");
const loginIdentifierWarning = document.querySelector(
  ".login-identifier-warning"
);
const loginPasswordWarning = document.querySelector(".login-password-warning");
const loginBtn = document.querySelector(".login-box__login-btn");
const hideLoginPasswordBtn = document.querySelector(".hide-password-login");
const signupPasswordInput = document.getElementById("password-input");
const signupPasswordWarning = document.querySelector(".sup-password-warning");
const signupFullnameWarning = document.querySelector(".sup-fullname-warning");
const signupUsernameWarning = document.querySelector(".sup-username-warning");
const signupEmailWarning = document.querySelector(".sup-email-warning");
const signupBtn = document.querySelector(".signup-box__signup-btn");
const signupUploadBtn = document.querySelector(".signup-box__upload");
const signupImgBox = document.querySelector(".signup-box__imgbox");
const signupImg = document.querySelector(".signup-box__img");
const imgRemoveBtn = document.querySelector(".signup-box__remove-img");
const signupFileInput = document.getElementById("profileInput");
const signupFullnameInput = document.getElementById("fullname-input");
const signupUsernameInput = document.getElementById("username-input");
const signupEmailInput = document.getElementById("email-input");
const signupImgWarning = document.querySelector(".signup-box__img-warning");
const signupHidePassword = document.querySelector(".signup-box__password-hide");
const profileBtnImg = document.querySelector(".user-profile-btn__img");
const mainProfileBtn = document.querySelector(".user-profile-btn");
const userMenu = document.querySelector(".user-menu");
const loginForgotBtn = document.querySelector(".login-box__forgot");
const askEmail = document.querySelector(".ask-email");
const reqPasswordOTPBtn = document.querySelector(".request-password-otp");
const askOTP = document.querySelector(".ask-otp");
const recoveryEmailInput = document.getElementById("recovery-email-input");
const newOTPReqPasswordBtn = document.querySelector(
  ".request-new-password-otp"
);
const newOTPReqEmailBtn = document.querySelector(".request-new-email-otp");
const passwordOTPVerifyBtn = document.querySelector(".verify-password-otp");
const emailOTPVerifyBtn = document.querySelector(".verify-email-otp");
const otpInputs = document.querySelectorAll(".otp-input");
const resetPasswordHideBtn = document.querySelector(".reset-password__hide");
const resetPasswordInput = document.getElementById("reset-password-input");
const resetPasswordBtn = document.querySelector(".reset-password__btn");
const reqEmailOTPBtn = document.querySelector(".request-email-otp");
const logoutBtn = document.querySelector(".logout-btn");
const mainProfileImageBox = document.querySelector(".user-menu__imgbox");
const mainProfileImage = document.querySelector(".user-menu__img");
const changeProfileImageInput = document.getElementById("change-image-input");
const changeProfileImageLabel = document.querySelector(".change-image-btn");
const removeProfileImageBtn = document.querySelector(".user-menu__remove-img");
const changeNameInput = document.getElementById("change-name-input");
const changeNameBtn = document.querySelector(".change-fullname-btn");
const userFullnameDisplay = document.querySelector(".user-menu__fullname");
const initFullnameChangeBtn = document.querySelector(".user-menu__edit-name");
const initPasswordChangeBtn = document.querySelector(
  ".user-menu__change-password"
);
const oldPasswordInput = document.getElementById("old-password-input");
const newPasswordInput = document.getElementById("new-password-input");
const oldPasswordHide = document.querySelector(".old-password-hide");
const newPasswordHide = document.querySelector(".new-password-hide");
const changePasswordBtn = document.querySelector(".change-password-btn");
const showUploadedSongsBtn = document.querySelector(".display-uploaded-songs");
const showAudioUploadBtn = document.querySelector(".display-upload-window");
const showSavedPlaylistsBtn = document.querySelector(
  ".display-saved-playlists"
);
const showImportedPresetsBtn = document.querySelector(
  ".display-imported-presets"
);
const showPublishedPresetsBtn = document.querySelector(
  ".display-published-presets"
);
const showCreatePlaylistBtn = document.querySelector(
  ".display-create-playlist"
);
const showCreatedPlaylistsBtn = document.querySelector('.display-created-playlists');

let passwordIsHidden = true;
let isSignupPasswordHidden = true;
let isResetPasswordHidden = true;
let isOldPasswordHidden = true;
let isNewPasswordHidden = true;

export const profileImage = { currentProfileImage: null };

const initOTPRequest = async function (type, email = null) {
  const success = await requestOTP(type, email);
  if (type === "password") data.forgotPasswordEmail = email;
  document.querySelector(".forgot-email").textContent = email;

  if (!success) return;

  otpCountDownTimer("otp-countdown");

  if (type === "password") {
    newOTPReqPasswordBtn.classList.remove("hide");
    newOTPReqEmailBtn.classList.add("hide");
    passwordOTPVerifyBtn.classList.remove("hide");
    emailOTPVerifyBtn.classList.add("hide");
  } else if (type === "email") {
    newOTPReqPasswordBtn.classList.add("hide");
    newOTPReqEmailBtn.classList.remove("hide");
    passwordOTPVerifyBtn.classList.add("hide");
    emailOTPVerifyBtn.classList.remove("hide");
  }

  windowManager(".ask-otp", "show");
};

export const initUserOperations = function () {
  loginBoxBtn.addEventListener("click", function () {
    windowManager(".login-box", "show");
  });

  signupBoxBtn.addEventListener("click", function () {
    signupBox.classList.remove("hidden");
  });

  mainProfileBtn.addEventListener("click", function () {
    userMenu.classList.remove("hidden");
  });

  // *************************************************************
  // LOGIN LOGIC
  // *************************************************************

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

    if (passwordValidator(password, "returnOnly") === "rejected") {
      loginPasswordWarning.classList.remove("hidden");
      loginPasswordWarning.textContent = "Invalid password!";
      return;
    }

    const loginInfo = {
      identifier: identifier,
      password: password,
    };

    sendLoginInfo(loginInfo);
  });

  // *************************************************************
  // SIGN UP LOGIC
  // *************************************************************

  signupImgBox.addEventListener("click", function () {
    signupUploadBtn.click();
  });

  signupFileInput.addEventListener("change", function () {
    profileImage.currentProfileImage = this.files[0];

    signupImgWarning.classList.add("hidden");

    if (!profileImage.currentProfileImage) return;

    const imageUrl = URL.createObjectURL(profileImage.currentProfileImage);
    signupImg.src = imageUrl;

    signupImg.onload = function () {
      URL.revokeObjectURL(imageUrl);
    };
  });

  imgRemoveBtn.addEventListener("click", function () {
    profileImage.currentProfileImage = null;
    signupImg.src = "/default-profile-img.webp";
  });

  signupFullnameInput.addEventListener("input", function () {
    setTimeout(() => {
      if (!isValidName(this.value)) {
        signupFullnameWarning.classList.remove("hidden");
        signupFullnameWarning.textContent = "This name is not allowed!";
      } else {
        signupFullnameWarning.classList.add("hidden");
      }
    }, 300);
  });

  signupUsernameInput.addEventListener("input", function () {
    setTimeout(() => {
      if (!isValidUsername(this.value)) {
        signupUsernameWarning.classList.remove("hidden");
        signupUsernameWarning.textContent = "This username is not allowed!";
      } else {
        signupUsernameWarning.classList.add("hidden");
      }
    }, 300);
  });

  signupEmailInput.addEventListener("input", function () {
    setTimeout(() => {
      if (!isValidEmail(this.value)) {
        signupEmailWarning.classList.remove("hidden");
        signupEmailWarning.textContent =
          "Please provide a valid email address!";
      } else {
        signupEmailWarning.classList.add("hidden");
      }
    }, 300);
  });

  signupPasswordInput.addEventListener("input", function () {
    setTimeout(() => {
      const password = this.value;
      passwordValidator(password, "ui");
      signupPasswordWarning.classList.add("hidden");
    }, 300);
  });

  signupHidePassword.addEventListener("click", function () {
    isSignupPasswordHidden = !isSignupPasswordHidden;

    if (isSignupPasswordHidden) {
      this.innerHTML = '<ion-icon name="eye-off"></ion-icon>';
      signupPasswordInput.type = "password";
    } else {
      this.innerHTML = '<ion-icon name="eye"></ion-icon>';
      signupPasswordInput.type = "text";
    }
  });

  signupBtn.addEventListener("click", async function () {
    const password = signupPasswordInput.value;
    const fullname = signupFullnameInput.value;
    const username = signupUsernameInput.value;
    const email = signupEmailInput.value;

    if (
      profileImage.currentProfileImage &&
      fileSizeConverter(profileImage.currentProfileImage.size, "mb") > 2.0
    ) {
      signupImgWarning.classList.remove("hidden");
      return;
    }

    if (fullname.trim() === "") {
      signupFullnameWarning.classList.remove("hidden");
      signupFullnameWarning.textContent = "Your full name is required!";
      return;
    }

    if (username.trim() === "") {
      signupUsernameWarning.classList.remove("hidden");
      signupUsernameWarning.textContent = "New username is required!";
      return;
    }

    if (email.trim() === "") {
      signupEmailWarning.classList.remove("hidden");
      signupEmailWarning.textContent = "A valid email address is required!";
      return;
    }

    if (password.trim() === "") {
      signupPasswordWarning.classList.remove("hidden");
      signupPasswordWarning.textContent = "Please create password!";
      return;
    }

    if (
      !isValidName(fullname) ||
      !isValidUsername(username) ||
      !isValidEmail(email)
    )
      return;

    if (passwordValidator(password, "returnOnly") === "rejected") {
      signupPasswordWarning.classList.remove("hidden");
      signupPasswordWarning.textContent =
        "Kindly fix the password with following requirements!";
      return;
    }

    const formData = new FormData();

    if (profileImage.currentProfileImage) {
      formData.append("profileImage", profileImage.currentProfileImage);
    }

    formData.append("fullname", fullname);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    await sendSignupInfo(formData);
  });

  // *************************************************************
  // OTP INPUT BEHAVIOUR LOGIC
  // *************************************************************

  otpInputs.forEach((input, i) => {
    input.addEventListener("input", function (e) {
      if (e.target.value.length === 1 && i < otpInputs.length - 1) {
        otpInputs[i + 1].focus();
      }
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !e.target.value && i > 0) {
        otpInputs[i - 1].focus();
      }
    });
  });

  const getOTP = function () {
    return Array.from(otpInputs)
      .map((input) => input.value)
      .join("");
  };

  // *************************************************************
  // FORGOT PASSWORD OTP VERIFICATION LOGIC
  // *************************************************************

  loginForgotBtn.addEventListener("click", function () {
    windowManager(".login-box", "hide");
    windowManager(".ask-email", "show");
  });

  reqPasswordOTPBtn.addEventListener("click", async function () {
    const email = recoveryEmailInput.value;
    windowManager(".ask-email", "hide");
    await initOTPRequest("password", email);
  });

  newOTPReqPasswordBtn.addEventListener("click", async function () {
    const email = data.forgotPasswordEmail;
    await initOTPRequest("password", email);
  });

  passwordOTPVerifyBtn.addEventListener("click", async function () {
    const email = data.forgotPasswordEmail;
    const otp = getOTP();

    const success = await verifyOTP("password", otp, email);

    if (success) {
      windowManager(".ask-otp", "hide");
      windowManager(".reset-password", "show");

      otpInputs.forEach((input) => {
        input.value = "";
      });
    }
  });

  // *************************************************************
  // RESET PASSWORD LOGIC
  // *************************************************************

  resetPasswordHideBtn.addEventListener("click", function () {
    isResetPasswordHidden = !isResetPasswordHidden;

    if (isResetPasswordHidden) {
      this.innerHTML = '<ion-icon name="eye-off"></ion-icon>';
      resetPasswordInput.type = "password";
    } else {
      this.innerHTML = '<ion-icon name="eye"></ion-icon>';
      resetPasswordInput.type = "text";
    }
  });

  resetPasswordBtn.addEventListener("click", async function () {
    const email = data.forgotPasswordEmail;
    const password = resetPasswordInput.value;

    const resetSuccessful = await resetPassword(email, password);

    if (resetSuccessful) {
      windowManager(".reset-password", "hide");
      confirmText.textContent = "Password changed. You can login now.";
      windowManager(".confirmation-window", "show");
    }
  });

  // *************************************************************
  // EMAIL VERIFICATION LOGIC
  // *************************************************************

  reqEmailOTPBtn.addEventListener("click", async function () {
    const email = data.userData.email;
    await initOTPRequest("email", email);
  });

  newOTPReqEmailBtn.addEventListener("click", async function () {
    const email = data.userData.email;
    await initOTPRequest("email", email);
  });

  emailOTPVerifyBtn.addEventListener("click", async function () {
    const otp = getOTP();

    const success = await verifyOTP("email", otp);

    if (success) {
      windowManager(".ask-otp", "hide");

      document.querySelector(".email-verify").classList.add("hide");

      otpInputs.forEach((input) => {
        input.value = "";
      });
    }
  });

  // *************************************************************
  // LOG OUT USER LOGIC
  // *************************************************************

  logoutBtn.addEventListener("click", async function () {
    loadingText.textContent = "Logging out";
    windowManager(".loading-window", "show");
    await logoutUser();
    windowManager(".loading-window", "hide");
  });

  // *************************************************************
  // CHANGING PROFILE IMAGE LOGIC
  // *************************************************************

  mainProfileImageBox.addEventListener("click", function () {
    changeProfileImageLabel.click();
  });

  changeProfileImageInput.addEventListener("change", async function () {
    const image = this.files[0];

    if (!image) return;

    const formdata = new FormData();

    formdata.append("profileImage", image);

    loadingText.textContent = "Changing Profile Photo";

    windowManager(".loading-window", "show");

    const changed = await changeProfileImage(formdata);

    windowManager(".loading-window", "hide");

    if (changed) {
      const imageUrl = URL.createObjectURL(image);
      mainProfileImage.src = imageUrl;
      profileBtnImg.src = imageUrl;

      setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
      }, 5000);
    }
  });

  // *************************************************************
  // REMOVE PROFILE IMAGE LOGIC
  // *************************************************************

  removeProfileImageBtn.addEventListener("click", async function () {
    loadingText.textContent = "Removing Profile Photo";

    windowManager(".loading-window", "show");

    const removed = await removeProfileImage();

    windowManager(".loading-window", "hide");

    if (!removed) return;

    mainProfileImage.src = "/default-profile-img.webp";
    profileBtnImg.src = "/default-profile-img.webp";
  });

  // *************************************************************
  // CHANGE NAME LOGIC
  // *************************************************************

  initFullnameChangeBtn.addEventListener("click", function () {
    windowManager(".change-fullname-window", "show");
  });

  changeNameBtn.addEventListener("click", async function () {
    const newName = changeNameInput.value;

    if (!newName) return;

    loadingText.textContent = "Changing display name";

    windowManager(".loading-window", "show");

    const changed = await changeName(newName);

    windowManager(".loading-window", "hide");

    if (!changed) return;

    windowManager(".change-fullname-window", "hide");

    userFullnameDisplay.textContent = newName;
  });

  // *************************************************************
  // CHANGE PASSWORD LOGIC
  // *************************************************************

  initPasswordChangeBtn.addEventListener("click", function () {
    windowManager(".change-password-window", "show");
  });

  oldPasswordHide.addEventListener("click", function () {
    isOldPasswordHidden = !isOldPasswordHidden;

    if (isOldPasswordHidden) {
      this.innerHTML = '<ion-icon name="eye-off"></ion-icon>';
      oldPasswordInput.type = "password";
    } else {
      this.innerHTML = '<ion-icon name="eye"></ion-icon>';
      oldPasswordInput.type = "text";
    }
  });

  newPasswordHide.addEventListener("click", function () {
    isNewPasswordHidden = !isNewPasswordHidden;

    if (isNewPasswordHidden) {
      this.innerHTML = '<ion-icon name="eye-off"></ion-icon>';
      newPasswordInput.type = "password";
    } else {
      this.innerHTML = '<ion-icon name="eye"></ion-icon>';
      newPasswordInput.type = "text";
    }
  });

  changePasswordBtn.addEventListener("click", async function () {
    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;

    if (!oldPassword || !newPassword) return;

    loadingText.textContent = "Changing password";

    windowManager(".loading-window", "show");

    const changed = await changePassword(oldPassword, newPassword);

    windowManager(".loading-window", "hide");

    if (!changed) return;

    windowManager(".change-password-window", "hide");

    confirmText.textContent = "Password changed successfully.";

    windowManager(".confirmation-window", "show");

    oldPasswordInput.value = "";
    newPasswordInput.value = "";
  });

  showUploadedSongsBtn.addEventListener("click", function () {
    windowManager(".uploaded-songlist", "show");
  });

  showAudioUploadBtn.addEventListener("click", function () {
    windowManager(".upload-song", "show");
  });

  showSavedPlaylistsBtn.addEventListener("click", function () {
    windowManager(".saved-playlists", "show");
  });

  showImportedPresetsBtn.addEventListener("click", function () {
    windowManager(".imported-presets", "show");
  });

  showPublishedPresetsBtn.addEventListener("click", function () {
    windowManager(".published-presets", "show");
  });

  showCreatePlaylistBtn.addEventListener("click", function () {
    windowManager(".create-playlist", "show");
  });

  showCreatedPlaylistsBtn.addEventListener("click", function () {
    windowManager(".created-playlists", "show");
  });
};

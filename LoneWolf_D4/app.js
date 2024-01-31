// ALL FUNCTIONS
function r_e(id) {
  return document.querySelector(`#${id}`);
}

// Function to configure message bar with text and color class
function configure_message_bar(msg, colorClass) {
  const messageBar = r_e("message_bar");
  messageBar.innerHTML = msg;

  // Set the background color class dynamically
  messageBar.className = `p-2 has-text-centered ${colorClass} is-hidden is-bold is-size-5 has-text-white`;

  // Show the message bar
  messageBar.classList.remove("is-hidden");

  // Hide the message bar after 2 seconds
  setTimeout(() => {
    messageBar.classList.add("is-hidden");
    messageBar.innerHTML = "";
  }, 2000);
}

function toggleButtonsVisibility() {
  const signupbtn = r_e("signupbtn");
  const loginbtn = r_e("loginbtn");
  const signoutbtn = r_e("signoutbtn");

  // Check if a user is logged in
  const user = auth.currentUser;
  if (user) {
    signupbtn.style.display = "none";
    loginbtn.style.display = "none";
    signoutbtn.style.display = "inline-block";
  } else {
    signupbtn.style.display = "inline-block";
    loginbtn.style.display = "inline-block";
    signoutbtn.style.display = "none";
  }
}

// Function to check if the password meets security requirements
function isPasswordSecure(password) {
  // Check length, presence of at least 1 special character, and at least 1 number
  const passwordRegex =
    /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[0-9]).{8,}$/;
  return passwordRegex.test(password);
}

// Function to validate the form
function validateForm() {
  const petType = r_e("pet_type").value;
  const petBreed = r_e("pet_breed").value;
  const petName = r_e("pet_name").value;
  const petDesc = r_e("pet_desc").value;
  const petLocation = r_e("pet_location").value;
  const petImage = r_e("pet_image").value;

  // Check if any required field is empty
  if (
    petType === "" ||
    petBreed === "" ||
    petName === "" ||
    petDesc === "" ||
    petLocation === "" ||
    petImage === ""
  ) {
    return false;
  }

  // console.log(petType, petBreed, petName);

  return true;
}

function show_pets(email) {
  if (email) {
    // console.log("inside email");

    db.collection("Pets")
      .get()
      .then((data) => {
        let docs = data.docs;

        let html = "";
        // loop through the docs array
        docs.forEach((doc) => {
          html += `<div class="box is-flex is-flex-direction-column is-align-items-center">
          <h1 class="title is-size-3 has-text-danger-dark">${
            doc.data().pet_name
          }</h1>
          <h2 class="subtitle is-size-5 has-text-info mb-1">${
            doc.data().pet_type
          }</h2>
          <p class="is-size-6"><strong>Breed:</strong> ${
            doc.data().pet_breed
          }</p>
          <p class="is-size-6"><strong>Location:</strong> ${
            doc.data().pet_location
          }</p>
          <p class="is-size-6 mb-2"><strong>Added by:</strong> <a href="mailto:${
            doc.data().author
          }" style="color: blue">${doc.data().author}</a></p>
        
          <p class="centered">
          <img src="${
            doc.data().url
          }" style="max-height: 500px; width: 500px;" />
        </p>
          <p class="is-size-6 has-text-centered">${doc.data().pet_desc}</p>
          
          
          </div>`;
        });

        r_e("main_adopt_inside").innerHTML = html;
      });
  }
}

function deletePet(id, author) {
  const currentUserEmail = auth.currentUser ? auth.currentUser.email : null;

  if (currentUserEmail === author) {
    // User is authorized to delete the pet
    db.collection("Pets")
      .doc(id)
      .delete()
      .then(() => {
        configure_message_bar(
          "Pet deleted successfully",
          "has-background-danger"
        );
      })
      .catch((error) => {
        // console.error("Error deleting pet: ", error);
      });
  } else {
    alert("You are not authorized to delete this pet.");
  }
  show_pets(auth.currentUser.email);
}

function search_pets(key, value) {
  // Check if filter is provided
  if (key && value) {
    // Reference to the collection
    db.collection("Pets")
      .where(key, "==", value)
      .get()
      .then((data) => {
        let docs = data.docs;

        let html = "";
        // loop through the docs array
        docs.forEach((doc) => {
          const isMyPet =
            auth.currentUser && doc.data().author === auth.currentUser.email;

          html += `<div class="box is-flex is-flex-direction-column is-align-items-center">
            <h1 class="title is-size-3 has-text-danger-dark">${
              doc.data().pet_name
            }</h1>
            <h2 class="subtitle is-size-5 has-text-info mb-1">${
              doc.data().pet_type
            }</h2>
            <p class="is-size-6"><strong>Breed:</strong> ${
              doc.data().pet_breed
            }</p>
            <p class="is-size-6"><strong>Location:</strong> ${
              doc.data().pet_location
            }</p>
            <p class="is-size-6 mb-2"><strong>Added by:</strong> <a href="mailto:${
              doc.data().author
            }" style="color: blue">${doc.data().author}</a></p>
          
            <p class="centered">          
            <img src="${
              doc.data().url
            }" style="max-height: 500px; width: 500px;" />
            </p>

            <p class="is-size-6 has-text-centered">${doc.data().pet_desc}</p>
            
            ${
              isMyPet
                ? `<button class="button is-danger is-small mt-3" onclick="deletePet('${
                    doc.id
                  }', '${doc.data().author}')">Delete My Pet</button>`
                : ""
            }
          </div>`;
        });
        r_e("main_adopt_inside").innerHTML = html;
      });
  } else {
    if (!auth.currentUser.email) {
      configure_message_bar(
        `You have to be signed-in to see content`,
        "has-background-danger"
      );
    }
  }
}

// r_e("testing").addEventListener("click", () => {
//   console.log("testing button");
// });

r_e("submit_pet").addEventListener("click", () => {
  // Check if all required fields are filled
  if (!validateForm()) {
    // Display error message above the submit button
    r_e("unfilled_form").innerHTML = "*You must fill all fields";

    return;
  }
  // construct a pet object

  let file = r_e("pet_image").files[0];

  // making a unique url using the date()
  let image = new Date() + "_" + file.name;

  // get image url first

  const task = ref.child(image).put(file);

  task
    .then((snapshot) => snapshot.ref.getDownloadURL())
    .then((url) => {
      let pet = {
        pet_type: r_e("pet_type").value,
        pet_breed: r_e("pet_breed").value,
        pet_name: r_e("pet_name").value,
        pet_desc: r_e("pet_desc").value,
        pet_location: r_e("pet_location").value,
        url: url,
        author: auth.currentUser.email,
      };

      //  send the recipe details to firestore

      pet_modal.classList.remove("is-active");

      db.collection("Pets")
        .add(pet)
        .then(() => {
          configure_message_bar(
            "You added a new pet to the adoption universe :)",
            "has-background-warning"
          );
          r_e("pet_form").reset();
        });
    });
});

// ALL EVENT LISTENERS, etc.

// Call the function initially to set the initial visibility
toggleButtonsVisibility();
auth.onAuthStateChanged((user) => {
  toggleButtonsVisibility();
});

document.addEventListener("DOMContentLoaded", function () {
  // Get all "navbar-burger" elements
  const burger = Array.from(
    document.querySelectorAll(".navbar-burger"),
    (element) => {
      element.addEventListener("click", () => {
        // Get the target from the "data-target" attribute
        const targetId = element.dataset.target;
        const target = document.getElementById(targetId);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        element.classList.toggle("is-active");
        target.classList.toggle("is-active");
      });
    }
  );
});

signupbtn.addEventListener("click", () => {
  signup_modal.classList.add("is-active");
});
signup_modalbg.addEventListener("click", () => {
  signup_modal.classList.remove("is-active");
});

// login modal
loginbtn.addEventListener("click", () => {
  login_modal.classList.add("is-active");
});
login_modalbg.addEventListener("click", () => {
  login_modal.classList.remove("is-active");
});

// sign-up
r_e("signup_button").addEventListener("click", async (e) => {
  // prevent page from auto refresh
  e.preventDefault();

  // get email and password
  let email = r_e("email").value;
  let password = r_e("password").value;

  // Check if the email is already in use
  try {
    // This function throws an error if the email is already in use
    await auth.fetchSignInMethodsForEmail(email);
    // If no error occurs, it means the email is not in use, so proceed to check password security
  } catch (error) {
    // Email is already in use
    r_e("password_requirements_message").innerHTML =
      "Email is already in use. Please try again with another email.";
    return;
  }

  // Check password security
  const passwordRequirementsMessage = r_e("password_requirements_message");
  if (!isPasswordSecure(password)) {
    // Password does not meet security requirements
    passwordRequirementsMessage.innerHTML =
      "Password must be at least 8 characters long and contain at least 1 special character and 1 number.";
    return;
  } else {
    // Clear the password requirements message if the password is secure
    passwordRequirementsMessage.innerHTML = "";
  }

  try {
    // Attempt to create the user with the actual password
    await auth.createUserWithEmailAndPassword(email, password);

    // User creation successful
    // console.log("user created");
    // console.log(auth.currentUser);

    configure_message_bar(
      `Account ${auth.currentUser.email} has been created`,
      "has-background-danger"
    );

    // reset the form
    r_e("signup_form").reset();

    // close the modal
    signup_modal.classList.remove("is-active");
  } catch (error) {
    // Handle other errors during user creation
    // console.error("Error creating user:", error.message);
    r_e("password_requirements_message").innerHTML =
      "Email is already in use. Please try again with another email.";
    signup_modal.classList.remove("is-active");
    r_e("signup_form").reset();
    return;
  }
});

// log in
r_e("login_form").addEventListener("submit", async (e) => {
  // prevent page from auto refresh
  e.preventDefault();

  // get email and password
  let email = r_e("email_").value;
  let password = r_e("password_").value;

  // Check if the email exists
  try {
    // This function throws an error if the email doesn't exist
    await auth.fetchSignInMethodsForEmail(email);
    // If no error occurs, it means the email exists, so proceed to check password
  } catch (error) {
    // Email does not exist
    r_e("incorrect_pw").innerHTML = "Incorrect email or password";
    return;
  }

  // Check password
  try {
    // Attempt to sign in the user with the provided email and password
    await auth.signInWithEmailAndPassword(email, password);

    // User successfully signed in
    // console.log("user signed in");
    // console.log(auth.currentUser);

    configure_message_bar(
      `Welcome back, ${auth.currentUser.email}!`,
      `has-background-danger`
    );

    // reset the form
    r_e("login_form").reset();

    // close the modal
    login_modal.classList.remove("is-active");
  } catch (error) {
    // Handle login errors
    if (error.code === "auth/wrong-password") {
      // Incorrect password
      r_e("incorrect_pw").innerHTML = "Incorrect email or password";
    } else {
      // Other errors
      r_e("incorrect_pw").innerHTML = "Incorrect email or password";
      signin_modal.classList.remove("is-active");
      r_e("signin_form").reset();
    }
  }
});

// sign out
r_e("signoutbtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    configure_message_bar("You are now logged out!", `has-background-danger`);
    r_e("myaccount").classList.add("is-hidden");
  });
});

// ADOPTION STUFF
// let postpet_button = document.querySelector("#postpet_button");
// let pet_modal = document.querySelector("#pet_modal");
// let pet_modalbg = document.querySelector("#pet_modalbg");

postpet_button.addEventListener("click", () => {
  if (!auth.currentUser) {
    // User is not signed in, show a message
    configure_message_bar(
      "You must be signed in to post a pet.",
      "has-background-danger"
    );
  } else {
    pet_modal.classList.add("is-active");
  }
});

pet_modalbg.addEventListener("click", () => {
  pet_modal.classList.remove("is-active");
});

auth.onAuthStateChanged((user) => {
  const userEmailElement = r_e("user_email");
  const accountCircle = r_e("account-circle");

  if (user) {
    const firstLetter = user.email.charAt(0).toUpperCase();
    userEmailElement.innerHTML = user.email;
    r_e("myaccount").classList.remove("is-hidden");

    accountCircle.innerHTML = `${firstLetter}`;
    accountCircle.style.display = "block";
  } else {
    userEmailElement.innerHTML = "";
    accountCircle.style.display = "none";
  }
});

r_e("search_button").addEventListener("click", () => {
  const searchBoxValue = r_e("search_box").value;
  search_pets("pet_location", searchBoxValue);
  r_e("search_box").value = ""; // Clear the search box after searching
});

// Event listener for filter by type dropdown change
r_e("filter_by_type_dropdown").addEventListener("change", () => {
  // Get selected pet type from the dropdown
  const petType = r_e("filter_by_type_dropdown").value;

  // Call search_pets function with the selected pet type
  search_pets("pet_type", petType);
  // console.log("petType", petType);
});

r_e("my_pets_button").addEventListener("click", () => {
  // console.log("my_pets_button PETS");

  search_pets("author", auth.currentUser.email);
});

home.addEventListener("click", () => {
  r_e("main_home").classList.remove("is-hidden");
  r_e("main_adopt").classList.add("is-hidden");
  r_e("main_about").classList.add("is-hidden");
});

adopt.addEventListener("click", () => {
  if (auth.currentUser) {
    r_e("main_home").classList.add("is-hidden");
    r_e("main_adopt").classList.remove("is-hidden");
    r_e("main_about").classList.add("is-hidden");

    show_pets(auth.currentUser.email);
  } else {
    // console.log("NO SIGN IN");
    configure_message_bar(
      `You have to be signed-in to see content`,
      "has-background-danger"
    );
  }
});

about.addEventListener("click", () => {
  r_e("main_home").classList.add("is-hidden");
  r_e("main_adopt").classList.add("is-hidden");
  r_e("main_about").classList.remove("is-hidden");
});

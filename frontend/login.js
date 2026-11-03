// ==========================================
// LAST-MILE DELIVERY OPTIMIZER
// LOGIN PAGE
// ==========================================


// Spring Boot login API
// We will create this endpoint later.

const LOGIN_API =
    "http://localhost:8080/api/auth/login";



// ==========================================
// HTML ELEMENTS
// ==========================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const loginBtn =
    document.getElementById(
        "loginBtn"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );


const togglePassword =
    document.getElementById(
        "togglePassword"
    );


const rememberMe =
    document.getElementById(
        "rememberMe"
    );



// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

togglePassword.addEventListener(
    "click",
    function () {

        if (
            passwordInput.type
            ===
            "password"
        ) {

            passwordInput.type =
                "text";


            togglePassword.textContent =
                "🙈";

        }

        else {

            passwordInput.type =
                "password";


            togglePassword.textContent =
                "👁";

        }

    }
);



// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    message,
    type
) {

    loginMessage.textContent =
        message;


    loginMessage.className =
        "message " + type;
}



// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            emailInput
                .value
                .trim();


        const password =
            passwordInput
                .value;


        // Basic frontend validation

        if (
            email === ""
            ||
            password === ""
        ) {

            showMessage(
                "Please enter email and password.",
                "error"
            );

            return;
        }


        loginBtn.disabled =
            true;


        loginBtn.textContent =
            "Signing in...";


        showMessage(
            "",
            ""
        );


        try {

            const response =
                await fetch(
                    LOGIN_API,
                    {

                        method:
                            "POST",


                        headers: {

                            "Content-Type":
                                "application/json"

                        },


                        body:
                            JSON.stringify(
                                {

                                    email:
                                        email,

                                    password:
                                        password

                                }
                            )

                    }
                );


            if (!response.ok) {

                let errorMessage =
                    "Invalid email or password.";


                try {

                    const errorData =
                        await response.json();


                    if (
                        errorData.message
                    ) {

                        errorMessage =
                            errorData.message;
                    }

                }

                catch (error) {

                    // Ignore JSON parsing
                    // error for failed response.

                }


                throw new Error(
                    errorMessage
                );
            }



            const data =
                await response.json();



            // ==================================
            // TOKEN
            // ==================================

            /*
               Later our Spring Boot backend
               can return an authentication
               token.

               Example response:

               {
                   "token": "...",
                   "name": "Afsar",
                   "email": "..."
               }
            */


            if (data.token) {

                if (
                    rememberMe.checked
                ) {

                    localStorage.setItem(
                        "authToken",
                        data.token
                    );

                }

                else {

                    sessionStorage.setItem(
                        "authToken",
                        data.token
                    );

                }

            }



            showMessage(
                "Login successful.",
                "success"
            );



            // Open optimizer dashboard

            setTimeout(
                function () {

                    window.location.href =
                        "index.html";

                },
                500
            );

        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );


            /*
               Until the Spring Boot
               authentication endpoint exists,
               fetch may fail because there is
               no /api/auth/login endpoint yet.
            */


            if (
                error instanceof TypeError
            ) {

                showMessage(
                    "Login backend is not connected yet.",
                    "error"
                );

            }

            else {

                showMessage(
                    error.message,
                    "error"
                );

            }

        }

        finally {

            loginBtn.disabled =
                false;


            loginBtn.textContent =
                "Sign In";

        }

    }
);

import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithCredential,
  signInWithPopup
} from "firebase/auth"
import { useEffect, useState } from "react"

// This is the firebase.ts file we created a few
// steps ago when we received our config!
import { auth } from "./firebase"

// We'll need to specify that we want Firebase to store
// our credentials in localStorage rather than in-memory
setPersistence(auth, browserLocalPersistence)

function IndexPopup() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User>(null)
  const [lastLog, setLastLog] = useState("")

  // Whenever the user clicks logout, we need to
  // use the auth object we imported from our firebase.ts
  // file and sign them out!
  const onLogoutClicked = async () => {
    if (user) {
      await auth.signOut()
    }
  }

  // When the user clicks log in, we need to ask Chrome
  // to log them in, get their Google auth token,
  // send it to Firebase, and let Firebase do its magic
  // if everything worked, we'll get a user object from them
  const onLoginClicked = () => {
    setLastLog("Clicked login")
    signInWithGoogle()
    // signInWithFacebook()
  }

  const signInWithGoogle = () => {
    chrome.identity.getAuthToken({ interactive: true }, async function (token) {
      if (chrome.runtime.lastError || !token) {
        console.error(chrome.runtime.lastError)
        setIsLoading(false)
        return
      }
      if (token) {
        const credential = GoogleAuthProvider.credential(null, token)
        try {
          // There's no need to do anything with what this returns
          // since we're keeping track of the user object with
          // onAuthStateChanged
          await signInWithCredential(auth, credential)
        } catch (e) {
          console.error("Could not log in. ", e)
        }
      }
    })
  }

  // Does not work because of manifestv3.
  // Firebase Oauth needs to access to api.google.com and v3 Content-security-policy does not allow it.
  // There are no workarounds for this.
  // Possible reroute:
  // 1. Link to open to another webapp.
  // 2. Webapp handles Oauth Login and registers to backend
  // 3. Backend setups confirmation process
  // 4. Once confirmed, backend adds user to store
  // 5.
  //
  // const signInWithFacebook = () => {
  //   setLastLog("signInWithFacebook")
  //
  //   const fbProvider = new FacebookAuthProvider()
  //   fbProvider.addScope("email")
  // chrome.identity.launchWebAuthFlow(
  //   { url: "<url-to-do-auth>", interactive: true },
  //   (response) => {}
  // )
  // signInWithPopup(auth, fbProvider).then((result) => {
  //   const user = result.user
  //   setLastLog("sign in")
  //   const credential = FacebookAuthProvider.credentialFromResult(result)
  // })
  // }

  // We register this listener once when this component starts
  useEffect(() => {
    // Whenever the auth changes, we make sure we're no longer loading
    // and set the user! On login, this will populate with a new user
    // on logout, this will make user null
    onAuthStateChanged(auth, (user) => {
      setIsLoading(false)
      setUser(user)
    })
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>Welcome to cedula</h1>
      {!user ? (
        <button
          onClick={() => {
            setIsLoading(true)
            // setOten(true)
            onLoginClicked()
          }}>
          Log in
        </button>
      ) : (
        <button
          onClick={() => {
            setIsLoading(true)
            onLogoutClicked()
          }}>
          Log out
        </button>
      )}
      <div>
        {isLoading ? "Loading..." : ""}
        {!!user ? (
          <div>
            Welcome to Plasmo, {user.displayName} your email address is{" "}
            {user.email}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}

export default IndexPopup

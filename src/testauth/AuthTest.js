// import React, {useState, useEffect} from 'react'
// import {supabase} from './supabaseClient'

// const Auth = () => {
//     const [session, setSession] = useState(null);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [resetPasswordMode, setResetPasswordMode] = useState(false);
//     const [showChangePassword, setShowChangePassword] = useState(false);
//     const [newPassword, setNewPassword] = useState('');
    
//     useEffect(() => {
//         const fetchSession = async () => {
//             try {
//                 const {data: {session}, } = await supabase.auth.getSession();
//                 setSession(session);
//             } catch (error) {
//                 console.error('Error fetching session;', error.message);  
//             }
//         };

//         fetchSession();
//     }, [])

//     const handleSignUp = async () => {
//         try {
//             const {user, error} = await supabase.auth.signUp({
//                 email,
//                 password
//             });
//             if (error) {
//                 throw error;
//             }
//             console.log('User signed up:', user);
//             alert('Sign up successful! Please check your email for confirmation.');
//         } catch (error) {
//             console.error('Error signing up:', error);
//             alert(error.message);
//         }
//     };

//     const handleSignIn = async () => {
//         try {
//             const {user, error} = await supabase.auth.signUp({
//                 email,
//                 password
//             });
//             if (error) {
//                 throw error;
//             }
//             console.log('User signed in:', user);
//             setSession(user);
//             alert('Sign in successful!');
//         } catch (error) {
//             console.error('Error signing in:', error);
//             alert(error.message);
//         }
//     };

//     const handleGoogleSignIn = async () => {
//         try {
//             const {user, error} = await supabase.auth.signInWithOAuth({
//                 provider: 'google',
//             });
//             if (error) {
//                 throw error;
//             }
//             console.log('User signed in with Google:', user);
//             setSession(user);
//         } catch (error) {
//             console.error('Error signing up with Google', error);
//             alert(error.message);
//         }
//     };

//     const handleForgotPassword = async () => {
//         setResetPasswordMode(true);
//     };

//     const handleResetPassword = async () => {
//         try {
//             const {error} = await supabase.auth.resetPasswordForEmail(email);
//             if (error){
//                 throw error;
//             }
//             alert('Password reset email sent! Check your inbox.');
//             setResetPasswordMode(false);
//             setEmail('');
//         } catch (error) {
//             console.error('Error resetting password:', error.message);
//             alert(error.message);
//         }
//     };

//     const handleChangePassowrd = async () => {
//         try {
//             const {error} = await supabase.auth.updateUser({
//                 newPassword
//             });
//             if (error) {
//                 throw error;
//             }
//             alert('Password updated successfully!');
//             setShowChangePassword(false);
//             setNewPassword('');
//         } catch (error) {
//             console.error('Error updating password:', error.message);
//             alert(error.message);
//         }
//     };

//     const handleSignOut = async () => {
//         try {
//             const {error} = await supabase.auth.signOut();
//             if (error) {
//                 throw error;
//             }
//             console.log('User signed out');
//             setSession(null);
//             alert('Sign out successful!');
//         } catch (error) {
//             console.error('Error signing out:', error);
//             alert(error.message);
//         }
//     };

//     return (
//         <div>
//             <h2>Supabase Auth</h2>
//             <p>User: {session ? session.user.email : 'Not signed in'}</p>
//             {!session && !resetPass && (
//                 <div>
//                     <input
//                         type="email"
//                         placeholder="Email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                     />
//                     <input 
//                         type="password"
//                         placeholder="Password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                     />
//                     <button onClick={handleSignUp}>Sign Up</button>
//                     <button onClick={handleForgotPassword}>Forgot Password?</button>
//                     <button onClick={handleSignIn}>Sign In</button>
//                     <button onClick={handleGoogleSignIn}>Sign In with Google</button>
//                 </div>
//                 )}
//                 {resetPasswordMode && (
//                     <div>
//                         <input
//                         type="email"
//                         placeholder="enter you Email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         />
//                         <button onClick={handleResetPassword}>Reset Password</button>
//                         <button onClick={() => setResetPasswordMode(false)}>Cancel</button>
//                     </div>
//                 )}
//                 {session && (
//                     <div>
//                         <button onClick={handleSignOut}>Sign Out</button>
//                         {!showChangePassword && (
//                             <button onClick={() => setShowChangePassword(true)}>Change Password</button>
//                         )}
//                         {showChangePassword && (
//                             <div>
//                                 <input 
//                                     type="password"
//                                     placeholder="New Password"
//                                     value={newPassword}
//                                     onChange={(e) => setNewPassword(e.target.value)}
//                                 />
//                                 <button onClick={handleChangePassowrd}>Update Password</button>
//                                 <button onClick={() => setShowChangePassword(false)}>Cancel</button>
//                             </div>
//                         )}
//                      </div>
//                 )}
//         </div>
//     );
// };

// export default Auth
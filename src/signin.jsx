import { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Fetch user based on username
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      alert('User not found!');
      setLoading(false);
      return;
    }

    // Check if the password matches
    const isPasswordValid = password === data.password; // You should hash and compare hashed passwords in a real app

    if (!isPasswordValid) {
      alert('Incorrect password!');
      setLoading(false);
      return;
    }

    // Successful login
    alert('Login successful!');
    navigate('/aggie-match'); // Redirect to home after successful login
    setLoading(false);
  };

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Aggie Match Sign In</h1>
        <form className="form-widget" onSubmit={handleSignIn}>
          <div>
            <input
              className="inputField"
              type="text"
              placeholder="Your username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              className="inputField"
              type="password"
              placeholder="Your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button className="button block" disabled={loading}>
              {loading ? <span>Loading</span> : <span>Sign in</span>}
            </button>
          </div>
        </form>
        <p>
          Don't have an account?{' '}
          <button onClick={() => navigate('/signup')} className="link-button">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

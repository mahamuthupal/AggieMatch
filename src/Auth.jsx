import { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Check if username already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (existingUser) {
      alert('Username already exists!');
      setLoading(false);
      return;
    }

    // Insert new user
    const { error } = await supabase.from('users').insert([
      { username, password }, // Store the password directly (hash it in a real app)
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert('Account created successfully!');
      navigate('/'); // Redirect to home after sign-up
    }
    setLoading(false);
  };

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Aggie Match Sign Up</h1>
        <form className="form-widget" onSubmit={handleSignUp}>
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
              {loading ? <span>Loading</span> : <span>Sign up</span>}
            </button>
          </div>
        </form>
        <p>
          Already have an account?{' '}
          <button onClick={() => navigate('/signin')} className="link-button">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

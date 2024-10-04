import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import AggieMatch from './AggieMatch';
import { Box } from '@chakra-ui/react';

export default function Account({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { user } = session || {};

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select(`username, avatar_url`)
          .eq('id', user.id)
          .single();

        if (!ignore) {
          if (error) {
            console.warn(error);
          } else if (data) {
            setUsername(data.username);
            setAvatarUrl(data.avatar_url);
          }
        }
      }

      setLoading(false);
    }

    getProfile();

    return () => {
      ignore = true;
    };
  }, [session]);

  async function updateProfile(event) {
    event.preventDefault();
    setLoading(true);
    const { user } = session || {};

    if (user) {
      const updates = {
        id: user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        alert(error.message);
      } else {
        setAvatarUrl(avatar_url);
      }
    }
    setLoading(false);
  }

  return (
    <Box w='100%' h='100vh' bgGradient='linear(to-l, #7928CA, #FF0080)' padding={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <form onSubmit={updateProfile} className="form-widget" style={{ width: '100%', maxWidth: '400px' }}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <button className="button block primary" type="submit" disabled={loading}>
            {loading ? 'Loading ...' : 'Update'}
          </button>
        </div>
      </form>

      <div>
        <button className="sign-out" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
        <AggieMatch session={session} />
      </div>
    </Box>
  );
}
  
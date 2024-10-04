import { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, SimpleGrid } from '@chakra-ui/react';
import SingleCard from './components/SingleCard';
import { supabase } from './supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

const cardImages = [
    { "src": "/img/headshot1.png", matched: false },
    { "src": "/img/headshot2.png", matched: false },
    { "src": "/img/headshot3.png", matched: false },
    { "src": "/img/headshot4.png", matched: false },
    { "src": "/img/headshot5.png", matched: false },
    { "src": "/img/headshot6.png", matched: false }
]

function AggieMatch({ session }) {
  const { state } = useLocation();
  const { username } = state; 

  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [bestScore, setBestScore] = useState(null); 
  const [bestTime, setBestTime] = useState(null); 
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); 
  const [timerActive, setTimerActive] = useState(false);
  const [leaderboard, setLeaderboard] = useState({ bestTimeUser: null, bestTimeValue: null, lowestMovesUser: null, lowestMovesValue: null });
  const navigate = useNavigate();

  const shuffleCards = () => {
    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, id: Math.random() }));
    
    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffledCards);
    setTurns(0);
    setCurrentTime(0); 
    setTimerActive(false); 
  };

  const handleChoice = (card) => {
    if (!timerActive) {
      setTimerActive(true);
    }
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  useEffect(() => {
    let timer;
    if (timerActive) {
      timer = setInterval(() => {
        setCurrentTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [timerActive]);

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      if (choiceOne.src === choiceTwo.src) {
        setCards(prevCards => {
          return prevCards.map(card => {
            if (card.src === choiceOne.src) {
              return { ...card, matched: true };
            } else {
              return card;
            }
          });
        });
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(prevTurns => prevTurns + 1);
    setDisabled(false);
  };

  const fetchBestTimeAndScore = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('moves, bestTime')
        .eq('username', username)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }

      if (userData) {
        if (userData.moves !== null) setBestScore(userData.moves);
        if (userData.bestTime !== null) setBestTime(userData.bestTime);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    shuffleCards();
    fetchBestTimeAndScore(); 
  }, []);

  useEffect(() => {
    checkCompletion();
  }, [cards]);

  const checkCompletion = async () => {
    if (cards.length > 0 && cards.every(card => card.matched)) {
      setTimerActive(false); 

      if (bestScore === null || turns < bestScore) {
        alert("New high score, congrats!");
        setBestScore(turns);
        handleSaveScore(turns);
      }

      if (bestTime === null || currentTime < bestTime) {
        alert("New best time, congrats!");
        setBestTime(currentTime);
        handleSaveTime(currentTime); 
      }
    }
  };

  const handleSaveScore = async (score) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
  
      if (userError) {
        console.error('Error fetching user ID:', userError);
        return;
      }
  
      const { data, error } = await supabase
        .from('users')
        .update({ moves: score }) 
        .eq('id', userData.id);
  
      if (error) {
        console.error('Error updating moves:', error);
      } else {
        console.log('Moves updated successfully:', data);
      }
    } catch (error) {
      console.error('Error during moves update:', error);
    }
  };
  

  const handleSaveTime = async (time) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError) {
        console.error('Error fetching user ID:', userError);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .update({ bestTime: time })
        .eq('id', userData.id);

      if (error) {
        console.error('Error inserting data:', error);
      }
    } catch (error) {
      console.error('Error during insertion:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, bestTime, moves')
        .order('bestTime', { ascending: true })
        .limit(1);
  
      if (error) throw error;
  
      if (data.length > 0) {
        setLeaderboard(prev => ({ ...prev, bestTimeUser: data[0].username, bestTimeValue: data[0].bestTime }));
      }
  
      const { data: lowestMovesData, error: movesError } = await supabase
        .from('users')
        .select('username, moves')
        .order('moves', { ascending: true })
        .limit(1);
  
      if (movesError) throw movesError;
  
      if (lowestMovesData.length > 0) {
        setLeaderboard(prev => ({ ...prev, lowestMovesUser: lowestMovesData[0].username, lowestMovesValue: lowestMovesData[0].moves }));
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };
  
  useEffect(() => {
    fetchLeaderboard();
  }, []);


  return (
    <div className="App">
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>Aggie Match</h1>
  
      <Box display="flex" justifyContent="space-between" padding="2px">
        <Box textAlign="left">
          {bestScore !== null && <p>Best Score: {bestScore}</p>}
          {bestTime !== null && <p>Best Time: {bestTime} seconds</p>}
        </Box>
        
        <Box display="flex" gap="20px">
          <button
            style={{
              background: '#ff7e5f',
              color: 'white',
              padding: '10px 10px',
              border: 'none',
              borderRadius: '5px',
              width: '130px',
            }}
            onClick={shuffleCards}
          >
            New Game
          </button>
  
          <button
            style={{
              background: '#feb47b',
              color: 'white',
              padding: '10px 10px',
              border: 'none',
              borderRadius: '5px',
              width: '120px',
            }}
            onClick={() => navigate('/signin')}
          >
            Sign Out
          </button>
        </Box>
      </Box>
  
      <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gridTemplateRows="repeat(3, 1fr)" gap={4} className="card-grid">
        {cards.map(card => (
          <SingleCard
            key={card.id}
            card={card}
            handleChoice={handleChoice}
            flipped={card === choiceOne || card === choiceTwo || card.matched}
            disabled={disabled}
          />
        ))}
      </Box>
  
      <Box display="flex" justifyContent="space-between" padding="0px">
        <p>Current Time: {currentTime} seconds</p>
        <p>Turns: {turns}</p>
      </Box>

      <Box padding="20px" textAlign="center">
        <Heading as="h3" size="lg">Leaderboard</Heading>
        {leaderboard.bestTimeUser && (
          <Text>Best Time: {leaderboard.bestTimeUser} - {leaderboard.bestTimeValue} seconds</Text>
        )}
        {leaderboard.lowestMovesUser && (
          <Text>Lowest Moves: {leaderboard.lowestMovesUser} - {leaderboard.lowestMovesValue} moves</Text>
        )}
      </Box>

    </div>
  );
  
}  

export default AggieMatch
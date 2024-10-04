import { useState, useEffect } from 'react'
import './App.css'
import SingleCard from './components/SingleCard'
import { supabase } from './supabaseClient'
import { useLocation, useNavigate } from 'react-router-dom'

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

  return (
    <div className="App">
      <button onClick={() => navigate('/signin')}>Sign Out</button>
      <h1>Aggie Match</h1>
      <button onClick={shuffleCards}>New Game</button>

      <div className="card-grid">
        {cards.map(card => (
          <SingleCard
            key={card.id}
            card={card}
            handleChoice={handleChoice}
            flipped={card === choiceOne || card === choiceTwo || card.matched}
            disabled={disabled}
          />
        ))}
      </div>

      <p>Turns: {turns}</p>
      {bestScore !== null && <p>Best Score: {bestScore}</p>}
      <p>Current Time: {currentTime} seconds</p>
      {bestTime !== null && <p>Best Time: {bestTime} seconds</p>}
    </div>
  );
}

export default AggieMatch

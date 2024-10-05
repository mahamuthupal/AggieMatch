import { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, SimpleGrid } from '@chakra-ui/react';
import SingleCard from './components/SingleCard';
import { supabase } from './supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTrophy } from "react-icons/fa";

const cardImages = [
    { "src": "/AggieMatch/img/headshot1.png", matched: false },
    { "src": "/AggieMatch/img/headshot2.png", matched: false },
    { "src": "/AggieMatch/img/headshot3.png", matched: false },
    { "src": "/AggieMatch/img/headshot4.png", matched: false },
    { "src": "/AggieMatch/img/headshot5.png", matched: false },
    { "src": "/AggieMatch/img/headshot6.png", matched: false }
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
    <div className="App" style={{ backgroundColor: 'white', color: '#4B0082' }}>
        <Text
            bgGradient="linear(to-l, #63b3ed, #6B46C1)"
            bgClip="text"
            fontSize="6xl"
            fontWeight="extrabold"
            textAlign="center"
            marginBottom="20px"
            marginTop="-60px"
        >
            Aggie Match
        </Text>

        <Box display="flex" justifyContent="space-between" padding="2px">
          <Box textAlign="left">
            <Text color="black">
              <Text as="span" fontWeight="bold">Best Score:</Text> {bestScore !== null ? bestScore : ''} {bestScore !== null ? 'turns' : ''}
            </Text>
            <Text color="black">
              <Text as="span" fontWeight="bold">Best Time:</Text> {bestTime !== null ? bestTime : ''} {bestTime !== null ? 'seconds' : ''}
            </Text>
          </Box>
            
            <Box display="flex" justifyContent="flex-end" gap="20px" flexGrow={1}>
              <Box
                  as='button'
                  p={3}
                  color='white'
                  fontWeight='bold'
                  borderRadius='md'
                  border='0px'
                  borderColor='white'
                  bgGradient='linear(to-l, #63b3ed, #6B46C1)'
                  _hover={{
                      bgGradient: 'linear(to-l, #6B46C1, #63b3ed)',
                  }}
                  onClick={shuffleCards}
              >
                  New Game
              </Box>

              <Box
                  as='button'
                  p={3} 
                  color='white'
                  fontWeight='bold'
                  borderRadius='md'
                  border='0px'
                  borderColor='white'
                  bgGradient='linear(to-r, red.500, yellow.500)'
                  _hover={{
                      bgGradient: 'linear(to-r, yellow.500, red.500)',
                  }}
                  onClick={() => navigate('/signin')}
              >
                  Sign Out
              </Box>
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
                    style={{ border: '1px solid #4B0082' }} 
                />
            ))}
        </Box>

        <Box display="flex" justifyContent="space-between" width="100%" padding="1" color="#4B0082" flexGrow={1}>
        <Text color="black">
            <Text as="span" fontWeight="bold">Current Time:</Text> {currentTime} seconds
        </Text>
        <Text color="black">
            <Text as="span" fontWeight="bold">Turns:</Text> {turns}
        </Text>
        </Box>



        <Box padding="20px" textAlign="center">
        <Text
            bgGradient="linear(to-r, red.500, yellow.500)"
            bgClip="text"
            fontSize="4xl" 
            fontWeight="extrabold"
            textAlign="center"
            marginRight="1px"
        >
            Leaderboard
        </Text>
        <Box padding="20px" display="flex" justifyContent="space-between" alignItems="center" color="black" paddingX="200px">
            {leaderboard.bestTimeUser && (
                <Box>
                    <Text fontWeight="bold" fontSize="lg">Best Time</Text> 
                    <Text fontSize="lg">{leaderboard.bestTimeUser} - {leaderboard.bestTimeValue} seconds</Text> 
                </Box>
            )}
            {leaderboard.lowestMovesUser && (
                <Box>
                    <Text fontWeight="bold" fontSize="lg">Lowest Moves</Text>
                    <Text fontSize="lg">{leaderboard.lowestMovesUser} - {leaderboard.lowestMovesValue} moves</Text> 
                </Box>
            )}
        </Box>
        </Box>
    </div>
  );
}
export default AggieMatch
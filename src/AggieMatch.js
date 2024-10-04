import { useState, useEffect } from 'react'
import './App.css'
import SingleCard from './components/SingleCard'
import { supabase } from './supabaseClient'

const cardImages = [
    { "src": "/img/headshot1.png", matched: false},
    { "src": "/img/headshot2.png", matched: false},
    { "src": "/img/headshot3.png", matched: false},
    { "src": "/img/headshot4.png", matched: false},
    { "src": "/img/headshot5.png", matched: false},
    { "src": "/img/headshot6.png", matched: false}
]

function AggieMatch({session}) {
  const [cards, setCards] = useState([])
  const [turns, setTurns] = useState(0)
  const [bestScore, setBestScore] = useState(null)
  const [choiceOne, setChoiceOne] = useState(null)
  const [choiceTwo, setChoiceTwo] = useState(null)
  const [disabled, setDisabled] = useState(false)

  const shuffleCards = () => { 
    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, id: Math.random() }))
    
    setChoiceOne(null)
    setChoiceTwo(null)
    setCards(shuffledCards)
    setTurns(0)
  }

  const handleChoice = (card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card)
  }

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true)
      if (choiceOne.src === choiceTwo.src) {
        setCards(prevCards => {
          return prevCards.map(card => {
            if (card.src === choiceOne.src) {
              return {...card, matched: true}
            } else {
              return card
            }
          })
        })
        resetTurn()
      } else {
        setTimeout(() => resetTurn(), 1000)
      }
    }
  }, [choiceOne, choiceTwo])

  console.log(cards)

  const resetTurn = () => {
    setChoiceOne(null)
    setChoiceTwo(null)
    setTurns(prevTurns => prevTurns + 1)
    setDisabled(false)
  }

  useEffect(() =>{
    shuffleCards()
  }, [])

  useEffect(() => {
    checkCompletion()
  }, [cards])

  const checkCompletion = async () => {
    if (cards.length > 0 && cards.every(card => card.matched)) {
      if (bestScore === null || turns < bestScore) {
        setBestScore(turns)
        handleSaveScore(turns)
      }
    }
  }

  const handleSaveScore = async (score) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({ moves: score, user_id: session.user.id});

      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully:', data);
      }
    } catch (error) {
      console.error('Error during insertion:', error);
    }
  };

  return (

    <div className="App">
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
    </div>
  );
}

export default AggieMatch
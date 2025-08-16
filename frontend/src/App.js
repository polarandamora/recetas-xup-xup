import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    useEffect(() => {
        fetch('/api/recipes')
            .then(response => response.json())
            .then(data => setRecipes(data))
            .catch(error => console.error('Error fetching recipes:', error));
    }, []);

    const handleRecipeClick = (recipe) => {
        setSelectedRecipe(recipe);
    };

    const handleBack = () => {
        setSelectedRecipe(null);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Les Meves Receptes</h1>
            </header>
            <main>
                {selectedRecipe ? (
                    <RecipeDetails recipe={selectedRecipe} onBack={handleBack} />
                ) : (
                    <RecipeList recipes={recipes} onRecipeClick={handleRecipeClick} />
                )}
            </main>
        </div>
    );
}

const RecipeList = ({ recipes, onRecipeClick }) => (
    <div className="recipe-list">
        {recipes.map(recipe => (
            <div key={recipe.id} className="recipe-card" onClick={() => onRecipeClick(recipe)}>
                <div className="recipe-card-image-container">
                    {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.name} className="recipe-image" />}
                    <h2 className="recipe-title-overlay">{recipe.name}</h2>
                </div>
            </div>
        ))}
    </div>
);

const RecipeDetails = ({ recipe, onBack }) => {
    return (
        <div className="recipe-details">
            <div className="recipe-details-header">
                {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.name} className="recipe-details-image" />}
                <button onClick={onBack} className="back-button">←</button>
                <h1 className="recipe-details-title-overlay">{recipe.name}</h1>
            </div>
            <div className="recipe-content">
                <div className="ingredients">
                    <h2>Ingredients</h2>
                    <ul>
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient.toUpperCase()}</li>
                        ))}
                    </ul>
                </div>
                <div className="steps">
                    <h2>Pasos</h2>
                    <ol>
                        {recipe.steps.map((step, index) => (
                            <li key={index}>
                                {step}
                                {recipe.timers[index] > 0 && <Timer duration={recipe.timers[index]} />}
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};

const Timer = ({ duration }) => {
    const totalDurationSeconds = duration * 60;
    const [remainingTime, setRemainingTime] = useState(totalDurationSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTimeAtPause, setElapsedTimeAtPause] = useState(0); // in seconds

    useEffect(() => {
        let interval = null;

        if (isRunning && remainingTime > 0) {
            // Set startTime only once when starting or resuming
            if (startTime === null) {
                setStartTime(Date.now());
            }

            interval = setInterval(() => {
                const currentElapsed = (Date.now() - startTime) / 1000 + elapsedTimeAtPause;
                const newRemaining = totalDurationSeconds - currentElapsed;

                if (newRemaining <= 0) {
                    setRemainingTime(0);
                    setIsRunning(false);
                    clearInterval(interval);
                } else {
                    setRemainingTime(newRemaining);
                }
            }, 100); // Update every 100ms for smoother display
        } else if (!isRunning && remainingTime !== 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isRunning, remainingTime, startTime, elapsedTimeAtPause, totalDurationSeconds]);

    const toggle = () => {
        if (isRunning) { // Pausing
            setElapsedTimeAtPause(totalDurationSeconds - remainingTime);
            setIsRunning(false);
        } else { // Starting or Resuming
            setStartTime(Date.now());
            setIsRunning(true);
        }
    };

    const reset = () => {
        setIsRunning(false);
        setRemainingTime(totalDurationSeconds);
        setStartTime(null);
        setElapsedTimeAtPause(0);
    };

    const formatTime = () => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = Math.floor(remainingTime % 60); // Use floor for seconds
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer">
            <div className="time-display">{formatTime()}</div>
            <div className='timer-buttons'>
                <button onClick={toggle}>{isRunning ? 'Pausar' : 'Iniciar'}</button>
                <button onClick={reset}>Reiniciar</button>
            </div>
        </div>
    );
};

export default App;
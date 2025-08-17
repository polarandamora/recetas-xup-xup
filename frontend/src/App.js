import React, { useState, useEffect, useRef } from 'react';
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
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);
    const workerRef = useRef(null);

    useEffect(() => {
        // Create a new worker
        workerRef.current = new Worker('./worker.js', { type: 'module' });

        // Set up message handling
        workerRef.current.onmessage = (e) => {
            setTimeLeft(e.data.timeLeft);
            if (e.data.timeLeft === 0) {
                setIsActive(false);
            }
        };

        // Post initial message to set the duration
        workerRef.current.postMessage({ action: 'reset', duration });

        // Terminate the worker on component unmount
        return () => {
            workerRef.current.terminate();
        };
    }, [duration]);

    const toggle = () => {
        const newIsActive = !isActive;
        setIsActive(newIsActive);
        if (newIsActive) {
            workerRef.current.postMessage({ action: 'start', duration });
        } else {
            workerRef.current.postMessage({ action: 'pause' });
        }
    };

    const reset = () => {
        setIsActive(false);
        workerRef.current.postMessage({ action: 'reset', duration });
    };

    const formatTime = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer">
            <div className="time-display">{formatTime()}</div>
            <div className='timer-buttons'>
                <button onClick={toggle}>{isActive ? 'Pausar' : 'Iniciar'}</button>
                <button onClick={reset}>Reiniciar</button>
            </div>
        </div>
    );
};

export default App;
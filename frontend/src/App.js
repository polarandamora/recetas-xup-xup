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
                <img src={recipe.image} alt={recipe.name} />
                <h2>{recipe.name}</h2>
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

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (!isActive && timeLeft !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggle = () => {
        setIsActive(!isActive);
    };

    const reset = () => {
        setTimeLeft(duration * 60);
        setIsActive(false);
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
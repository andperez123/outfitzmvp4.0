import React from 'react';

const MaleQuestions = ({
    setVibe,
    setComfortLevel,
    setAdventurous,
    setFocus
}) => {
    return (
        <div>
            <div className="question-container">
                <h3 className="question-title">What type of vibe are you aiming for today?</h3>
                <select onChange={(e) => setVibe(e.target.value)} defaultValue="">
                    <option value="" disabled>Select an option</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="business">Business</option>
                    <option value="streetwear">Streetwear</option>
                    <option value="athletic">Athletic</option>
                </select>
            </div>

            <div className="question-container">
                <h3 className="question-title">How would you describe your comfort level with colors and patterns?</h3>
                <select onChange={(e) => setComfortLevel(e.target.value)} defaultValue="">
                    <option value="" disabled>Select an option</option>
                    <option value="minimal">Minimal - Stick to basics</option>
                    <option value="moderate">Moderate - Some colors okay</option>
                    <option value="adventurous">Adventurous - Bold choices welcome</option>
                </select>
            </div>

            <div className="question-container">
                <h3 className="question-title">How adventurous do you want to be with this outfit?</h3>
                <select onChange={(e) => setAdventurous(e.target.value)} defaultValue="">
                    <option value="" disabled>Select an option</option>
                    <option value="conservative">Conservative - Keep it safe</option>
                    <option value="balanced">Balanced - Mix of safe and bold</option>
                    <option value="daring">Daring - Push the boundaries</option>
                </select>
            </div>

            <div className="question-container">
                <h3 className="question-title">What's the main focus you want for this outfit?</h3>
                <select onChange={(e) => setFocus(e.target.value)} defaultValue="">
                    <option value="" disabled>Select an option</option>
                    <option value="overall">Overall Balance</option>
                    <option value="statement">Statement Piece</option>
                    <option value="layering">Layering</option>
                    <option value="simplicity">Simplicity</option>
                </select>
            </div>
        </div>
    );
};

export default MaleQuestions;
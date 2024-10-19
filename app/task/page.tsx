import React from 'react';
import styles from './TaskStyle.css';

const Task: React.FC = () => {
  return (
    <div>
      <div className="header">
        <div className="points">
          <span>₱ 1,500</span>
        </div>
      </div>
      <div className="task-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      </div>
      <div className="description">
        Complete the following tasks<br />and increase PG
      </div>
      <ul className="task-list">
        <li>
          <i className="fab fa-youtube"></i>
          <span>Subscribe PG YouTube channel :</span>
          <button onClick={() => alert('Subscribed to PG YouTube channel!')}>+200</button>
        </li>
        <li>
          <i className="fab fa-telegram-plane"></i>
          <span>Subscribe PG Telegram Channel :</span>
          <button onClick={() => alert('Subscribed to PG Telegram Channel!')}>+200</button>
        </li>
        <li>
          <i className="fab fa-twitter"></i>
          <span>Follow PG's X Handle :</span>
          <button onClick={() => alert('Followed PG\'s X Handle!')}>+200</button>
        </li>
        <li>
          <i className="fab fa-discord"></i>
          <span>Join PG's Discord Server :</span>
          <button onClick={() => alert('Joined PG\'s Discord Server!')}>+200</button>
        </li>
        <li>
          <i className="fab fa-instagram"></i>
          <span>Follow PG Instagram Handle :</span>
          <button onClick={() => alert('Followed PG Instagram Handle!')}>+200</button>
        </li>
      </ul>
      <div className="footer" style={{ margin: '0 20px' }}>
        <i className="fas fa-home"></i>
        <i className="fas fa-clipboard-list active"></i>
        <i className="fas fa-user-plus"></i>
      </div>
    </div>
  );
};

export default Task;

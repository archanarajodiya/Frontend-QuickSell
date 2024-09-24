import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KanbanBoard.css'; 

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]); 
  const [groupBy, setGroupBy] = useState('status'); 
  const [sortBy, setSortBy] = useState('priority'); 

  // Fetching data from the API
  useEffect(() => {
    axios.get('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then((response) => {
        setTickets(response.data.tickets || []); 
      })
      .catch((error) => {
        console.error('Error fetching tickets:', error);
        setTickets([]); 
      });
  }, []);

 
  useEffect(() => {
    const savedGroupBy = localStorage.getItem('kanbanGroupBy');
    const savedSortBy = localStorage.getItem('kanbanSortBy');
    if (savedGroupBy) setGroupBy(savedGroupBy);
    if (savedSortBy) setSortBy(savedSortBy);
  }, []);

  const handleGroupChange = (newGroup) => {
    setGroupBy(newGroup);
    localStorage.setItem('kanbanGroupBy', newGroup);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    localStorage.setItem('kanbanSortBy', newSort);
  };

  const groupTickets = (tickets) => {
    const grouped = {};
    tickets.forEach((ticket) => {
      let groupKey;
      if (groupBy === 'status') {
        groupKey = ticket.status;
      } else if (groupBy === 'user') {
        groupKey = ticket.assigned_to || 'Unassigned';
      } else if (groupBy === 'priority') {
        groupKey = ['No priority', 'Low', 'Medium', 'High', 'Urgent'][ticket.priority];
      }

      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(ticket);
    });
    return grouped;
  };

  const sortTickets = (tickets) => {
    return tickets.sort((a, b) => {
      if (sortBy === 'priority') return b.priority - a.priority;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  };

  const renderTickets = (groupedTickets) => {
    return Object.keys(groupedTickets).map((group) => (
      <div className="kanban-column" key={group}>
        <h3>{group}</h3>
        {groupedTickets[group].map((ticket) => (
          <div className="kanban-ticket" key={ticket.id}>
            <h4>{ticket.title}</h4>
            <p>{ticket.description}</p>
            <p>Priority: {['No priority', 'Low', 'Medium', 'High', 'Urgent'][ticket.priority]}</p>
          </div>
        ))}
      </div>
    ));
  };

  const sortedTickets = sortTickets([...tickets]); 
  const groupedTickets = groupTickets(sortedTickets);

  return (
    <div className="kanban-board">
      <div className="controls">
        <div className="dropdown">
          <label>Group by: </label>
          <select value={groupBy} onChange={(e) => handleGroupChange(e.target.value)}>
            <option value="status">Status</option>
            <option value="user">User</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <div className="dropdown">
          <label>Sort by: </label>
          <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="kanban-columns">
        {renderTickets(groupedTickets)}
      </div>
    </div>
  );
};

export default KanbanBoard;
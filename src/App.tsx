import React, { useState } from 'react';
import './App.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { ViewList, ViewStream } from '@mui/icons-material';

interface UrlItem {
  url: string;
  isUsed: boolean;
}

function App() {
  const [input, setInput] = useState<string>('');
  const [urlItems, setUrlItems] = useState<UrlItem[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'text'>('table');

  const removeDuplicateUrls = (text: string) => {
    const lines = text.split(/[\n\s]+/);
    
    const uniqueUrls = new Set(
      lines.filter(line => {
        try {
          const url = new URL(line);
          url.search = '';
          return url.toString();
        } catch {
          return false;
        }
      }).map(url => {
        // Видаляємо всі параметри після знаку питання та слеш в кінці
        return url.split('?')[0].replace(/\/$/, '');
      })
    );
    
    return Array.from(uniqueUrls).map(url => ({
      url,
      isUsed: false
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = () => {
    const cleanedUrls = removeDuplicateUrls(input);
    setUrlItems(cleanedUrls);
  };

  const handleCheckboxChange = (index: number) => {
    setUrlItems(prevItems => 
      prevItems.map((item, i) => 
        i === index ? { ...item, isUsed: !item.isUsed } : item
      )
    );
  };

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'table' | 'text' | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const renderTextOutput = () => (
    <textarea
      value={urlItems.map(item => item.url).join('\n')}
      readOnly
      placeholder="Результат буде тут"
      rows={10}
      className="output-area"
    />
  );

  const renderTableOutput = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Використано</TableCell>
            <TableCell>URL</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {urlItems.map((item, index) => (
            <TableRow 
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={item.isUsed}
                  onChange={() => handleCheckboxChange(index)}
                />
              </TableCell>
              <TableCell>
                <Typography
                  component="a"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {item.url}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Duplicates Remover</h1>
        <div className="container">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Вставте список URL (кожне посилання з нового рядка або через пробіл)"
            rows={10}
            className="input-area"
          />
          <div className="controls">
            <button onClick={handleSubmit} className="submit-button">
              Видалити дублікати
            </button>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              sx={{ ml: 2, bgcolor: 'white' }}
            >
              <ToggleButton value="table" aria-label="table view">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="text" aria-label="text view">
                <ViewStream />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          
          {urlItems.length > 0 && (
            viewMode === 'table' ? renderTableOutput() : renderTextOutput()
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
